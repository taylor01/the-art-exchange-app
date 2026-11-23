# GitHub settings the tag-gated deploy depends on (ENG-0002), from this root's
# outputs and the aws-org account baseline instead of copied by hand.

locals {
  repository = "the-art-exchange-app"
}

# The web deploy role trusts only jobs in this environment, and the
# environment accepts deployments from v* tags only.
resource "github_repository_environment" "production" {
  repository  = local.repository
  environment = "production"

  deployment_branch_policy {
    protected_branches     = false
    custom_branch_policies = true
  }
}

resource "github_repository_environment_deployment_policy" "release_tags" {
  repository  = local.repository
  environment = github_repository_environment.production.environment
  tag_pattern = "v*"
}

# Read by .github/workflows/deploy.yml. Identifiers only, not secrets.
locals {
  deploy_variables = {
    AWS_DEPLOY_ROLE_ARN = local.account.web_deploy_role_arn
    SITE_BUCKET         = aws_s3_bucket.site.bucket
    DISTRIBUTION_ID     = aws_cloudfront_distribution.site.id
    API_URL             = "https://api.${local.platform.zone_name}/api/v1"
  }
}

resource "github_actions_variable" "deploy" {
  for_each = local.deploy_variables

  repository    = local.repository
  variable_name = each.key
  value         = each.value
}
