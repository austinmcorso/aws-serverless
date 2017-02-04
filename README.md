# Serverless tools comparison

## Why?

Forgoing a server in favor of ephemeral handlers is an increasingly popular option
when developing web services. These handlers, provided through services like AWS Lambda,
are created on-demand from one of many triggers, and are destroyed once the handler finishes.
Because of their transient nature, this makes them attractive in terms of cost and scalability.

Coupled with other cloud services, such as DynamoDB or RDS for storage, and API Gateway as
an HTTP frontend, one can compose an entire architecture in which no virtual or physical servers
are necessary. Clearly for some projects, vendor lock-in and long-term support
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
- On upload, the service creates multiple versions of the image at different compression levels
- The user receives a link to a page with links to the different versions of the image,
and an example progressive loading experience.
- If the user visits the page before all of the images are generated, they should
see an "In-progress" indicator.

