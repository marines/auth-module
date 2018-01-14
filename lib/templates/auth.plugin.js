import './auth.middleware'
import authStore from './auth.store'

export default async function (context, inject) {
  // Register auth store module
  context.store.registerModule('auth', authStore, {
    preserveState: Boolean(context.store.state.auth),
  })

  // Backward compability for Nuxt <= RC.11
  if (!context.store.app.context) {
    context.store.app.context = context
  }

  <% if (options.token.enabled && options.token.refresh) { %>
  context.$axios.interceptors.response.use(response => response, async (error) => {
    const { config, response: { status } } = error;
    const originalRequest = config;

    if (status === 401 && context.store.state.auth.token && context.store.state.auth.refreshToken) {
      let fields = {
        refresh_token: context.store.state.auth.refreshToken
      }

      let data = await context.$axios.$post('<%= options.refreshToken.endpoint %>', fields)

      await context.store.dispatch('auth/updateToken', {
        token: data['<%= options.token.name %>']<% if (options.token.refresh) { %>,
        refreshToken: data['<%= options.token.refreshName %>']<% } %>
      })

      config.headers = {};
      return context.$axios(config);
    }

    return Promise.reject(error);
  })
  <% } %>

  // Fetch initial state
  await context.store.dispatch('auth/fetch')
}
