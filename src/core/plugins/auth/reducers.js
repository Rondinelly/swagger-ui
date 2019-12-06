import { fromJS, Map } from "immutable"
import { btoa } from "core/utils"
import { saveAuthorization } from "core/helpers/save-authorization"

import {
  SHOW_AUTH_POPUP,
  AUTHORIZE,
  AUTHORIZE_OAUTH2,
  LOGOUT,
  CONFIGURE_AUTH
} from "./actions"

export default {
  [SHOW_AUTH_POPUP]: (state, { payload } ) =>{
    return state.set( "showDefinitions", payload )
  },

  [AUTHORIZE]: (state, { payload } ) =>{
    let { auth, configs } = payload
    let securities = fromJS(auth)
    let map = state.get("authorized") || Map()

    // refactor withMutations
    securities.entrySeq().forEach( ([ key, security ]) => {
      let type = security.getIn(["schema", "type"])

      if ( type === "apiKey" || type === "http" ) {
        map = map.set(key, security)
        saveAuthorization(configs, key, security.getIn(["value"]))
      } else if ( type === "basic" ) {
        let username = security.getIn(["value", "username"])
        let password = security.getIn(["value", "password"])

        map = map.setIn([key, "value"], {
          username: username,
          header: "Basic " + btoa(username + ":" + password)
        })

        map = map.setIn([key, "schema"], security.get("schema"))
        saveAuthorization(configs, key, password)
      }
    })

    return state.set( "authorized", map )
  },

  [AUTHORIZE_OAUTH2]: (state, { payload } ) =>{
    let { auth, token } = payload
    let parsedAuth

    auth.token = Object.assign({}, token)
    parsedAuth = fromJS(auth)

    return state.setIn( [ "authorized", parsedAuth.get("name") ], parsedAuth )
  },

  [LOGOUT]: (state, { payload } ) =>{
    let { auths, configs } = payload

    let result = state.get("authorized").withMutations((authorized) => {
        auths.forEach((auth) => {
          authorized.delete(auth)
          saveAuthorization(configs, auth, "")
        })
      })

    return state.set("authorized", result)
  },

  [CONFIGURE_AUTH]: (state, { payload } ) =>{
    return state.set("configs", payload)
  }
}
