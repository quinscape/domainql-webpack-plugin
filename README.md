# DomainQL Webpack Plugin

Small webpack plugin that extracts preloaded graphql-queries from the webpack entry points

## Example

```js
export const PRELOADED_QUERIES = {
    // language=GraphQL
    foo: `{
        foo {
            name
            num
            longNum
            flag
            date
            timestamp
            moneys
        }
    }`
};

```

Here we see an example for a preloaded queries. It uses the magic `PRELOADED_QUERIES` identifier which gets recognized by this plugin.

The query must be a map of GraphQL queries which in turn can be a simple (template) string or a map with `query` and `variables` parameters.

The query must be a *static* expression for now. It gets evaluated with Nashorn on the server side, so you can use limited js to produce that 
static export. Note that the extraction method is stupid though and just cuts off everything above the static export, and requires/imports will not work.

## IntelliJ Integration

The language=GraphQL comment makes intellij recognize the template string as GraphQL if you have the installed the GraphQL plugin which I highly recommend.

