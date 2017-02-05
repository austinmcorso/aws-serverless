provider "aws" {
  region = "${var.aws_region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

# IAM
resource "aws_iam_role" "lambda_upload" {
    name = "lambda_upload"
}
resource "aws_iam_role" "lambda_optimize_image" {
    name = "lambda_optimize_image"
}

# LAMDA
resource "aws_lambda_function" "upload" {
  filename = "upload.zip"
  function_name = "upload"
  role = "${aws_iam_role.lambda_upload.arn}"
  handler = "index.handler"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("./lambdas/upload/upload.zip"))}"
}
/*
resource "aws_lambda_function" "optimize_image" {
  filename = "optimize_image.zip"
  function_name = "upload"
  role = "${aws_iam_role.lambda_optimize_image.arn}"
  handler = "index.handler"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("./lambdas/optimize_image.zip"))}"
}
*/

# API GATEWAY
resource "aws_api_gateway_rest_api" "mipmapper_api" {
  name = "mipmapper_api"
  description = "API for Mipmapper"
  depends_on = ["aws_lambda_function.upload"]
}
resource "aws_api_gateway_resource" "upload" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  parent_id = "${aws_api_gateway_rest_api.mipmapper_api.root_resource_id}"
  path_part = "upload"
}
resource "aws_api_gateway_method" "upload_post" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload.id}"
  http_method = "POST"
  authorization = "NONE"
}

# S3
resource "aws_s3_bucket" "client" {
    bucket = "${var.aws_s3_bucket_name}"
    acl = "public-read"

    website {
        index_document = "index.html"
    }
}
