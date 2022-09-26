import {
  DeclarationBlock,
  ParsedConfig,
  BaseVisitor,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { Directives, FieldResolverPluginConfig } from './config';
import {
  DirectiveNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
} from 'graphql';

export interface FieldResolverPluginParsedConfig extends ParsedConfig {
  typeSuffix: string;
}

type Directivable = { directives?: ReadonlyArray<DirectiveNode> };

export class FieldResolverVisitor extends BaseVisitor<FieldResolverPluginConfig, FieldResolverPluginParsedConfig> {
  constructor(pluginConfig: FieldResolverPluginConfig) {
    super(pluginConfig, ({
      typeSuffix: pluginConfig.typeSuffix || 'Object',
    } as Partial<FieldResolverPluginParsedConfig>) as any);
    autoBind(this);
  }

  private _getDirectiveFromAstNode(node: Directivable, directiveName: Directives): DirectiveNode | null {
    if (!node || !node.directives || node.directives.length === 0) {
      return null;
    }

    const foundDirective = node.directives.find(
      d => (d.name as any) === directiveName || (d.name.value && d.name.value === directiveName)
    );

    if (!foundDirective) {
      return null;
    }

    return foundDirective;
  }

  private _getNameOfFieldResolvers(fields: ReadonlyArray<FieldDefinitionNode>): FieldDefinitionNode[] {
    const fieldNames: FieldDefinitionNode[] = [];

    fields.forEach(field => {
      const isFieldResolverDirective = this._getDirectiveFromAstNode(field, Directives.FIELD_RESOLVER);
      const isComputedDirective = this._getDirectiveFromAstNode(field, Directives.COMPUTED);
      const isFieldResolver = isFieldResolverDirective || isComputedDirective
      if (isFieldResolver) {
        fieldNames.push(field)
      }
    });

    return fieldNames;
  }

  // noinspection JSUnusedGlobalSymbols
  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (['Query', 'Mutation', 'Subscription'].includes(node.name.value)) {
      return undefined;
    }

    const fields = this._getNameOfFieldResolvers(node.fields);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node, { suffix: this.config.typeSuffix }))
      .withContent(fields.length ? `Omit<${node.name.value}, ${fields.map(field => `'${field.name.value}'`).join(' | ')}>` : this.convertName(node, { suffix: '' })).string;
  }
}
