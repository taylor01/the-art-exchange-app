terraform {
  # Pinned to the latest stable minor until a standard version is set (ENG-0019).
  required_version = "~> 1.15.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.73"
    }
    tfe = {
      source  = "hashicorp/tfe"
      version = "~> 0.84"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.13"
    }
  }

  cloud {
    organization = "taylor01"

    workspaces {
      project = "art-exchange"
      name    = "art-exchange-web-production"
    }
  }
}
