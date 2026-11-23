locals {
  app        = "art-exchange"
  env        = "production"
  name       = "${local.app}-${local.env}"
  account_id = "225635745787" # taylor-art-exchange, vended by taylor01/aws-org

  default_tags = {
    app        = local.app # the web deploy role invalidates only distributions tagged app=art-exchange
    env        = local.env
    managed-by = "terraform"
    repo       = "taylor01/the-art-exchange-app"
  }
}

provider "aws" {
  region              = "us-east-2"
  allowed_account_ids = [local.account_id]

  default_tags {
    tags = local.default_tags
  }
}

# CloudFront certificates and log delivery live in us-east-1 (ENG-0010).
provider "aws" {
  alias               = "us_east_1"
  region              = "us-east-1"
  allowed_account_ids = [local.account_id]

  default_tags {
    tags = local.default_tags
  }
}

# Shared platform resources (zone, data key, edge web ACL, edge-logs bucket)
# come from taylor01/the-art-exchange-api infra/platform.
data "tfe_outputs" "platform" {
  organization = "taylor01"
  workspace    = "art-exchange-platform-production"
}

# The account baseline (web deploy role) lives in taylor01/aws-org.
data "tfe_outputs" "account" {
  organization = "taylor01"
  workspace    = "aws-org-taylor-art-exchange"
}

locals {
  platform = data.tfe_outputs.platform.nonsensitive_values
  account  = data.tfe_outputs.account.nonsensitive_values
}

# Repository settings for the deploy (github.tf). Authenticates with
# GITHUB_TOKEN; with local execution, `export GITHUB_TOKEN=$(gh auth token)`.
provider "github" {
  owner = "taylor01"
}
