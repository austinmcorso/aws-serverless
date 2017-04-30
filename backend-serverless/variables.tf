variable "access_key" {}
variable "account_id" {}
variable "secret_key" {}
variable "aws_s3_bucket_name" {}

variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "us-east-1"
}
