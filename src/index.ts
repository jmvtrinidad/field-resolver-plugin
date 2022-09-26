import {Types, PluginFunction, getCachedDocumentNodeFromSchema, oldVisit} from '@graphql-codegen/plugin-helpers'
import { GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import { FieldResolverVisitor } from './visitor';
import { FieldResolverPluginConfig, Directives } from './config';

export const plugin: PluginFunction<FieldResolverPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: FieldResolverPluginConfig
) => {
  const visitor = new FieldResolverVisitor(config);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, { leave: visitor as any });

  return visitorResult.definitions.filter(d => typeof d === 'string').join('\n');
};

export const addToSchema = gql`
    directive @${Directives.FIELD_RESOLVER} on FIELD_DEFINITION | OBJECT
    directive @${Directives.COMPUTED} on FIELD_DEFINITION | OBJECT
`;
