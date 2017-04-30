# Serverless tools comparison

## Demo
[https://s3.amazonaws.com/mipmapper/dist/index.html](https://s3.amazonaws.com/mipmapper/dist/index.html)

## Why?

Forgoing a server in favor of ephemeral handlers is an increasingly popular option
when developing web services. These handlers, provided through services like AWS Lambda,
are created on-demand from one of many triggers, and are destroyed shortly after the handler finishes and a cooldown has passed.
Because of their transient nature, this makes them attractive in terms of cost and scalability.

Coupled with other cloud services, such as DynamoDB or RDS for storage, and API Gateway as
an HTTP router, one can compose an entire architecture in which no virtual or physical server support is necessary. Clearly for some projects, vendor lock-in and long-term support
can be show-stoppers; however, in many cases, it is preferable to cede control to a
third party in exchange for decreased ops and infrastructure costs.

Should you decide to take the plunge into serverless, you are faced with
many new questions:

- What is the best way to create and package a lambda?
- How do I write my lambdas so that they are testable?
- How do I deploy my lambdas and other services for the first time?
- How do I update my lambdas / services while avoiding downtime?
- Do I need a traditional provisioning tool like CloudFormation or Terraform?
- Do frameworks like Serverless provide sufficient control to build a complex app in AWS?

This project is designed to aid in answering these questions, and to explain the tradeoffs
made when making decisions that affect how your application logic is developed and deployed.

## The Strawman

Initially, we are starting with a simple progressive image service:

- Users can upload an image to the service
- On upload, the service creates ~multiple~ version(s) of the image at different compression level(s)
- The user receives a preview and link to the image
- "In-progress" indicator.

## What we're building

We want to demonstrate best practices in two areas:

- Handler (Lambda) development
- Deployment of backing infrastructure
- BONUS: Check out those nifty Redux Observables for asynchronicity

In order to do this, we will need the following components:

V1.
- A lambda for uploading the original image, placing it in S3, and returning an id
- A lambda for resizing an image
- A static page in S3 for viewing image details, given an id

V2.
- A lambda for generating signed urls to S3 w/o cost of sending image itself through the Lambda

Using multiple components in the AWS ecosystem should provide us with opportunity to explore the differences in using Terraform or Cloudformation against specialized frameworks like Serverless or Apex. Having multiple Lambdas should also expose the variation and testing challenges when integrating with AWS services.
