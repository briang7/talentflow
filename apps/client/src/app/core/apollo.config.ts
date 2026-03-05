import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export function provideGraphQL() {
  return [
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: environment.graphqlUrl }),
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                employees: {
                  keyArgs: ['filter', 'sort'],
                  merge(existing, incoming) {
                    return incoming;
                  },
                },
              },
            },
          },
        }),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
          },
        },
      };
    }),
  ];
}
