provider "aws" {
  region = "${var.aws_region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

# IAM
resource "aws_iam_role" "lambda" {
    name = "lambda"
    assume_role_policy = <<EOF
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_role_policy_attachment" "lambda" {
    role = "${aws_iam_role.lambda.name}"
    policy_arn = "arn:aws:iam::aws:policy/AWSLambdaExecute"
}

# LAMDA
resource "aws_lambda_function" "upload" {
  filename = "lambdas/upload/upload.zip"
  function_name = "upload"
  role = "${aws_iam_role.lambda.arn}"
  handler = "index.handler"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("lambdas/upload/upload.zip"))}"
}
resource "aws_lambda_function" "process_image" {
  filename = "lambdas/process_image/process_image.zip"
  function_name = "process_image"
  role = "${aws_iam_role.lambda.arn}"
  handler = "index.handler"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("./lambdas/process_image/process_image.zip"))}"
}

# API GATEWAY
resource "aws_api_gateway_rest_api" "mipmapper_api" {
  name = "mipmapper_api"
  description = "API for Mipmapper"
  depends_on = ["aws_lambda_function.upload", "aws_lambda_function.process_image"]
}
resource "aws_api_gateway_resource" "upload" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  parent_id = "${aws_api_gateway_rest_api.mipmapper_api.root_resource_id}"
  path_part = "upload"
}
resource "aws_api_gateway_resource" "process_image" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  parent_id = "${aws_api_gateway_rest_api.mipmapper_api.root_resource_id}"
  path_part = "process"
}
resource "aws_api_gateway_method" "upload_post" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload.id}"
  http_method = "POST"
  authorization = "NONE"
}
resource "aws_api_gateway_integration" "upload_post_integration" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload.id}"
  http_method = "${aws_api_gateway_method.upload_post.http_method}"
  type = "AWS"
  integration_http_method = "${aws_api_gateway_method.upload_post.http_method}"
  uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.upload.arn}/invocations"
}
resource "aws_api_gateway_method_response" "200" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload.id}"
  http_method = "${aws_api_gateway_method.upload_post.http_method}"
  status_code = "200"
}
resource "aws_api_gateway_integration_response" "generator_integration_response" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload.id}"
  http_method = "${aws_api_gateway_method.upload_post.http_method}"
  status_code = "${aws_api_gateway_method_response.200.status_code}"
  depends_on = ["aws_api_gateway_integration.upload_post_integration"]
}
resource "aws_api_gateway_deployment" "production" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  stage_name = "prod"
  depends_on = ["aws_api_gateway_integration.upload_post_integration"]
}

# S3
resource "aws_s3_bucket" "client" {
    bucket = "${var.aws_s3_bucket_name}"
    acl = "public-read"

    website {
        index_document = "index.html"
    }
}
resource "aws_lambda_permission" "allow_s3" {
    statement_id = "AllowExecutionFromS3Bucket"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.process_image.arn}"
    principal = "s3.amazonaws.com"
    source_arn = "${aws_s3_bucket.client.arn}"
}
resource "aws_s3_bucket_notification" "upload" {
    bucket = "${aws_s3_bucket.client.id}"
    lambda_function {
        lambda_function_arn = "${aws_lambda_function.process_image.arn}"
        events = ["s3:ObjectCreated:*"]
        filter_prefix = "uploads/"
    }
}
