# CloudFront + WAF in front of the site (ENG-0012), at theartexch.com with www
# redirecting to it. Static and not personalized, so it is cached; the deploy
# sets long cache lifetimes on hashed assets and no-cache on index.html.

locals {
  apex = local.platform.zone_name
  www  = "www.${local.platform.zone_name}"
}

# --- Certificate (us-east-1, DNS-validated, hostname-scoped) -------------------

resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = local.apex
  subject_alternative_names = [local.www]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.site.domain_validation_options : option.domain_name => option
  }

  zone_id         = local.platform.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = 300
  records         = [each.value.resource_record_value]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

# --- Viewer-request function: www redirect and client-side routes -----------------

resource "aws_cloudfront_function" "viewer_request" {
  name    = "${local.name}-web-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "Redirect www to the apex; serve index.html for app routes."
  publish = true
  code    = <<-JS
    function handler(event) {
      var request = event.request;
      var host = request.headers.host && request.headers.host.value;

      if (host === "${local.www}") {
        var query = Object.keys(request.querystring).map(function (key) {
          var value = request.querystring[key].value;
          return value ? key + "=" + value : key;
        }).join("&");
        return {
          statusCode: 301,
          statusDescription: "Moved Permanently",
          headers: {
            location: { value: "https://${local.apex}" + request.uri + (query ? "?" + query : "") }
          }
        };
      }

      // React Router paths like /poster/123 have no file extension; the app
      // handles them in the browser from index.html.
      if (request.uri.indexOf(".") === -1) {
        request.uri = "/index.html";
      }

      return request;
    }
  JS
}

# --- Distribution ---------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${local.name}-web"
  description                       = "CloudFront access to the web app bucket."
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "${local.name} web app"
  aliases             = [local.apex, local.www]
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  web_acl_id          = local.platform.edge_web_acl_arn

  origin {
    origin_id                = "site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id           = "site"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
    compress                   = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# --- Access logs (standard logging v2) -> edge-logs/cloudfront/web/ (ENG-0015) -----

resource "aws_cloudwatch_log_delivery_source" "site" {
  provider     = aws.us_east_1
  name         = "${local.name}-web-cloudfront"
  log_type     = "ACCESS_LOGS"
  resource_arn = aws_cloudfront_distribution.site.arn
}

resource "aws_cloudwatch_log_delivery_destination" "site" {
  provider      = aws.us_east_1
  name          = "${local.name}-web-edge-logs"
  output_format = "json"

  delivery_destination_configuration {
    destination_resource_arn = "${local.platform.edge_logs_bucket_arn}/cloudfront/web"
  }
}

resource "aws_cloudwatch_log_delivery" "site" {
  provider                 = aws.us_east_1
  delivery_source_name     = aws_cloudwatch_log_delivery_source.site.name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.site.arn

  # Keep the edge request id for joining; leave cookies out (ENG-0015).
  record_fields = [
    "date", "time", "x-edge-location", "x-edge-request-id", "x-edge-result-type",
    "x-host-header", "c-ip", "cs-method", "cs-uri-stem", "cs-uri-query",
    "sc-status", "sc-bytes", "time-taken", "cs(User-Agent)", "cs(Referer)",
    "ssl-protocol", "x-forwarded-for",
  ]

  s3_delivery_configuration {
    suffix_path                 = "{yyyy}/{MM}/{dd}"
    enable_hive_compatible_path = false
  }
}

# --- DNS ------------------------------------------------------------------------------

resource "aws_route53_record" "site" {
  for_each = {
    for pair in setproduct([local.apex, local.www], ["A", "AAAA"]) : "${pair[0]}/${pair[1]}" => { name = pair[0], type = pair[1] }
  }

  zone_id = local.platform.zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
