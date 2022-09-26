# field-resolver-plugin

This is a plugin to graphql-code-generator to be used with chimp gql generator. 

Please see https://github.com/xolvio/chimp for more information

```js
// example codegen
const getCodegenConfig = require('./generated/graphql/getCodegenConfig')
const fs = require('fs')
const { pascalCase } = require('pascal-case')
const { isObjectType, Source, buildSchema } = require('graphql')

let schemaString = fs
  .readFileSync('./schema.graphql')
  .toString()
  .replace(/extend type/g, `type`)

const source = new Source(schemaString)
const schema = buildSchema(source, { assumeValidSDL: true })
const typeMap = schema.getTypeMap()

const getConfig = (type) => (type.toConfig ? type.toConfig().astNode : type.astNode)

const mappers = {}
for (const typeName in typeMap) {
  const type = schema.getType(typeName)
  if (isObjectType(type)) {
    if (getConfig(type)) {
      if (!['Query', 'Mutation', 'Subscription'].includes(getConfig(type).name.value)) {
        mappers[typeName] = `${pascalCase(typeName)}Object`
      }
    }
  }
}

const contextType = '~app/context#GqlContext'
module.exports = {
  overwrite: true,
  schema: schemaString,
  generates: {
    'generated/graphql/types.ts': {
      config: {
        contextType: contextType || `${process.env.APP_PREFIX}/context#GqlContext`,
        idFieldName: 'id',
        objectIdType: 'string',
        federation: true,
        mappers,
        scalars: {
          Upload: 'Promise<GraphQLFileUpload>',
        },
      },
      plugins: [
        'typescript',
        'typescript-resolvers',
        'typescript-operations',
        'field-resolver-plugin',
        { add: { content: 'export {GqlContext};' } },
        {
          add: {
            content: `
            import { ReadStream } from "fs-capacitor";
          interface GraphQLFileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(options?:{encoding?: string, highWaterMark?: number}): ReadStream;
}`,
          },
        },
      ],
    },
  },
}
```