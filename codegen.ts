import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:4000/graphql',
  documents: 'apps/client/src/**/*.graphql',
  generates: {
    'apps/client/src/app/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        addExplicitOverride: true,
        namedClient: 'talentflow',
        serviceName: 'TalentFlowService',
        serviceProvidedInRoot: true,
      },
    },
  },
};

export default config;
