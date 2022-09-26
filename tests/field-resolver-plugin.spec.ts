import { validateTs } from '@graphql-codegen/testing';
import { plugin, addToSchema } from '../src';
import { buildSchema, print, GraphQLSchema } from 'graphql';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

describe('Plugin Resolver', () => {
  const validate = async (content: Types.PluginOutput, schema: GraphQLSchema, config: any) => {
    const tsPluginOutput = await tsPlugin(schema, [], config, { outputFile: '' });
    const result = mergeOutputs([tsPluginOutput, content]);
    await validateTs(result);
  };

  const schema = buildSchema(/* GraphQL */ `
    ${print(addToSchema)}

    type User {
      id: ID
      name: String
      someLink: LinkType
      type: Boolean @fieldResolver
      objectType: LinkType @computed
      listType: [SecondType] @fieldResolver
    }

    type LinkType {
        id: ID!
    }
    
    type SecondType {
        id: ID!
        name: String! @fieldResolver
    }
  `);

  describe('Config', () => {
    it('Should accept typeSuffix', async () => {
      const result = await plugin(schema, [], { typeSuffix: 'Obj' }, { outputFile: '' });
      expect(result).toContain(`export type UserObj = Omit<User, 'type' | 'objectType' | 'listType'>;`);
      expect(result).toContain(`export type LinkTypeObj = LinkType;`);
      expect(result).toContain(`export type SecondTypeObj = Omit<SecondType, 'name'>;`);
      await validate(result, schema, {});
    });
  });
});
