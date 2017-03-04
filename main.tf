provider "aws" {
  region = "${var.aws_region}"
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
}

# IAM
resource "aws_iam_role" "lambda_role" {
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

resource "aws_iam_policy" "lambda_store_image_policy" {
    name = "lambda_upload_store_image_policy"
    path = "/"
    description = "My test policy"
    policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "${aws_s3_bucket.client.arn}/uploads"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_execute_policy_attachment" {
    role = "${aws_iam_role.lambda_role.name}"
    policy_arn = "arn:aws:iam::aws:policy/AWSLambdaExecute"
}

resource "aws_iam_role_policy_attachment" "lambda_s3_policy_attachment" {
    role = "${aws_iam_role.lambda_role.name}"
    policy_arn = "${aws_iam_policy.lambda_store_image_policy.arn}"
}

# LAMDA
resource "aws_lambda_function" "upload_image_lambda_function" {
  filename = "mipmapper.zip"
  function_name = "upload_image"
  role = "${aws_iam_role.lambda_role.arn}"
  handler = "index.upload"
  runtime = "nodejs4.3"
  source_code_hash = "${base64sha256(file("./mipmapper.zip"))}"
}

resource "aws_lambda_function" "process_image_lambda_function" {
  filename = "mipmapper.zip"
  function_name = "process_image"
  role = "${aws_iam_role.lambda_role.arn}"
  handler = "index.processImage"
  runtime = "nodejs4.3"
  timeout = 15
  source_code_hash = "${base64sha256(file("./mipmapper.zip"))}"
}

# API GATEWAY
resource "aws_api_gateway_rest_api" "mipmapper_api" {
  name = "mipmapper_api"
  description = "API for Mipmapper"
  depends_on = [
    "aws_lambda_function.upload_image_lambda_function",
    "aws_lambda_function.process_image_lambda_function"
  ]
  binary_media_types = [
    "image/png",
    "image/jpeg",
    "image/jpg"
  ]
}

resource "aws_api_gateway_resource" "upload_image_api_gateway_resource" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  parent_id = "${aws_api_gateway_rest_api.mipmapper_api.root_resource_id}"
  path_part = "images"
}

resource "aws_api_gateway_method" "upload_image_api_gateway_method" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload_image_api_gateway_resource.id}"
  http_method = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "upload_image_api_gateway_integration" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload_image_api_gateway_resource.id}"
  http_method = "${aws_api_gateway_method.upload_image_api_gateway_method.http_method}"
  type = "AWS"
  integration_http_method = "${aws_api_gateway_method.upload_image_api_gateway_method.http_method}"
  uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.upload_image_lambda_function.arn}/invocations"

  request_templates {
   "image/png" = <<EOF
{
  "imageType": "png",
  "base64Image" : "$input.body"
}
EOF
  "image/jpeg" = <<EOF
{
  "imageType": "jpg",
  "base64Image" : "$input.body"
}
EOF
  "image/jpg" = <<EOF
{
  "imageType": "jpg",
  "base64Image" : "$input.body"
}
EOF
 }
}

resource "aws_api_gateway_method_response" "200" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload_image_api_gateway_resource.id}"
  http_method = "${aws_api_gateway_method.upload_image_api_gateway_method.http_method}"
  status_code = "200"
}
resource "aws_api_gateway_integration_response" "upload_image_api_gateway_integration_response" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  resource_id = "${aws_api_gateway_resource.upload_image_api_gateway_resource.id}"
  http_method = "${aws_api_gateway_method.upload_image_api_gateway_method.http_method}"
  status_code = "${aws_api_gateway_method_response.200.status_code}"
  depends_on = ["aws_api_gateway_integration.upload_image_api_gateway_integration"]
}

resource "aws_api_gateway_deployment" "production" {
  rest_api_id = "${aws_api_gateway_rest_api.mipmapper_api.id}"
  stage_name = "prod"
  depends_on = ["aws_api_gateway_integration.upload_image_api_gateway_integration"]
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
    function_name = "${aws_lambda_function.process_image_lambda_function.arn}"
    principal = "s3.amazonaws.com"
    source_arn = "${aws_s3_bucket.client.arn}"
}
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.upload_image_lambda_function.function_name}"
  principal     = "apigateway.amazonaws.com"
}
resource "aws_s3_bucket_notification" "upload" {
    bucket = "${aws_s3_bucket.client.id}"
    lambda_function {
        lambda_function_arn = "${aws_lambda_function.process_image_lambda_function.arn}"
        events = ["s3:ObjectCreated:*"]
        filter_prefix = "uploads/"
    }
}
