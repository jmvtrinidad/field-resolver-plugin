import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

export interface FieldResolverPluginConfig extends RawConfig {
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `type`s.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   typeSuffix: MyType
   * ```
   */
  typeSuffix?: string;
}

export enum Directives {
  FIELD_RESOLVER = 'fieldResolver',
  COMPUTED = 'computed'
}
