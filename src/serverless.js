const { Component } = require('@serverless/core')
const { EventBridge } = require('tencent-component-toolkit')
const { ApiTypeError } = require('tencent-component-toolkit/lib/utils/error')
const CONFIGS = require('./config')

class ServerlessComponent extends Component {
  getCredentials() {
    const { tmpSecrets } = this.credentials.tencent

    if (!tmpSecrets || !tmpSecrets.TmpSecretId) {
      throw new ApiTypeError(
        'CREDENTIAL',
        'Cannot get secretId/Key, your account could be sub-account and does not have the access to use SLS_QcsRole, please make sure the role exists first, then visit https://cloud.tencent.com/document/product/1154/43006, follow the instructions to bind the role to your account.'
      )
    }

    return {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
  }

  async deploy(inputs) {
    console.log(`Deploying EventBridge`)

    // get tencent cloud credentials
    const credentials = this.getCredentials()

    const eb = new EventBridge(credentials, inputs.region)

    inputs.oldState = this.state
    inputs.eventBusId = inputs.eventBusId || this.state.eventBusId
    inputs.uin = inputs.uin || this.state.uin

    // make default config
    inputs.region = inputs.region || CONFIGS.region
    inputs.type = inputs.type || CONFIGS.type
    inputs.eventBusName = inputs.eventBusName || CONFIGS.eventBusName
    inputs.description = inputs.description || CONFIGS.description

    // format connnections config
    if (inputs.connections && inputs.connections.length > 0) {
      inputs.connections = inputs.connections.map((item) => {
        // find exist connection in state to get connectionId
        if (
          inputs.oldState &&
          inputs.oldState.connections &&
          inputs.oldState.connections.length > 0
        ) {
          const existConn = inputs.oldState.connections.find((oldConn) => {
            const qcsItems = oldConn.connectionDescription.ResourceDescription.split('/')
            const tempServiceId = qcsItems[qcsItems.length - 1]
            return item.serviceId === tempServiceId
          })
          if (existConn) {
            item.connectionId = existConn.connectionId
          }
        }
        item.connectionName = item.connectionName || CONFIGS.connection.connectionName
        item.enable = CONFIGS.connection.enable
        item.type = CONFIGS.connection.type
        if (item.serviceId) {
          item.connectionDescription = {
            serviceId: item.serviceId,
            gwParams: {
              Protocol: 'HTTP',
              Method: item.method || 'POST'
            }
          }
        }
        return item
      })

      // Disable which connection binded before but not in current connection config
      if (
        inputs.oldState &&
        inputs.oldState.connections &&
        inputs.oldState.connections.length > 0
      ) {
        const needDisableConns = inputs.oldState.connections.filter((item) => {
          return !inputs.connections.find((cur) => cur.connectionId === item.connectionId)
        })
        if (needDisableConns.length > 0) {
          const needUpdateConns = needDisableConns.map((item) => {
            const qcsItems = item.connectionDescription.ResourceDescription.split('/')
            const tempServiceId = qcsItems[qcsItems.length - 1]
            return {
              connectionId: item.connectionId,
              connectionName: item.connectionName,
              enable: false,
              type: item.type,
              description: item.description,
              connectionDescription: {
                serviceId: tempServiceId,
                gwParams: {
                  Protocol: 'HTTP',
                  Method: item.connectionDescription.APIGWParams.Method
                }
              }
            }
          })
          inputs.connections = inputs.connections.concat(needUpdateConns)
        }
      }
    } else {
      inputs.connections = [
        {
          connectionName: CONFIGS.connection.connectionName,
          type: CONFIGS.connection.type,
          enable: CONFIGS.connection.enable
        }
      ]
    }

    // format rules config
    if (inputs.rules && inputs.rules.length > 0) {
      // P.S: ruleId need config in yml, cannot find the unique one in exist rules
      inputs.rules = inputs.rules.map((item) => {
        item.enable = item.enable || CONFIGS.rule.enable
        item.ruleName = item.ruleName || CONFIGS.rule.ruleName
        item.type = item.type || CONFIGS.rule.type
        item.eventPattern = item.eventPattern || CONFIGS.rule.eventPattern
        item.description = item.description || CONFIGS.rule.description
        if (item.targets && item.targets.length > 0) {
          item.targets = item.targets.map((target) => {
            target.type = CONFIGS.rule.targetType
            target.functionNamespace = target.functionNamespace || CONFIGS.rule.targetFuncNamespace
            target.functionVersion = target.functionVersion || CONFIGS.rule.targetFucnVersion
            return target
          })
        }
        return item
      })
    }

    const deployRes = await eb.deploy(inputs)
    this.state = deployRes

    const outputs = {
      uin: deployRes.uin,
      region: deployRes.region,
      eventBusId: deployRes.eventBusId,
      eventBusName: deployRes.eventBusName,
      type: deployRes.type,
      description: deployRes.description
    }

    if (deployRes.connections && deployRes.connections.length > 0) {
      outputs.connections = deployRes.connections.map((conn) => {
        const qcsItems = conn.connectionDescription.ResourceDescription.split('/')
        const tempServiceId = qcsItems[qcsItems.length - 1]
        return {
          connectionId: conn.connectionId,
          connectionName: conn.connectionName,
          description: conn.description,
          type: conn.type,
          serviceId: tempServiceId,
          method: conn.connectionDescription.APIGWParams.Method
        }
      })
    }

    if (deployRes.rules && deployRes.rules.length > 0) {
      outputs.rules = deployRes.rules.map((rule) => {
        const targetList = []
        if (rule.targets && rule.targets.length > 0) {
          rule.targets.forEach((target) => {
            // e.g: "qcs::scf:ap-guangzhou:uin/100012340001:namespace/default/function/helloworld-123456789/$DEFAULT"
            const qcfItems = target.targetDescription.resourceDescription.split('/')
            targetList.push({
              targetId: target.targetId,
              type: target.type,
              functionNamespace: qcfItems[2],
              functionName: qcfItems[4],
              functionVersion: qcfItems[5]
            })
          })
        }
        return {
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          eventPattern: rule.eventPattern,
          type: rule.type,
          description: rule.description,
          targets: targetList
        }
      })
    }

    return outputs
  }

  async remove() {
    console.log(`Removing EventBridge`)

    // get tencent cloud credentials
    const credentials = this.getCredentials()

    const { region, eventBusId } = this.state
    const eb = new EventBridge(credentials, region)

    if (eventBusId) {
      await eb.remove(eventBusId)
    }

    this.state = {}
    return {}
  }
}

module.exports = ServerlessComponent
