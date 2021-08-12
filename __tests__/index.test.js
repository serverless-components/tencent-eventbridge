const CONFIGS = require('../src/config')
const { generateId, getServerlessSdk } = require('./lib/utils')

describe('EventBridge', () => {
  const appId = process.env.TENCENT_APP_ID
  const uin = process.env.TENCENT_UIN
  const credentials = {
    tencent: {
      SecretId: process.env.TENCENT_SECRET_ID,
      SecretKey: process.env.TENCENT_SECRET_KEY
    }
  }

  // const connections = [
  //   {
  //     connectionName: 'eb-conn',
  //     serviceId: 'service-jntxmiro',
  //     method: 'POST'
  //   }
  // ]
  const rules = [
    {
      ruleName: 'test_eb_rule',
      eventPattern: '{\n  "source": ["apigw.cloud.tencent"]\n}',
      targets: [
        {
          functionName: 'serverless-unit-test',
          functionNamespace: 'default',
          functionVersion: '$DEFAULT'
        }
      ]
    }
  ]
  const instanceYaml = {
    org: appId,
    app: 'appDemo',
    component: 'eventbridge@dev',
    name: `eb-integration-tests-${generateId()}`,
    stage: 'dev',
    inputs: {
      eventBusName: 'sls_eb_test',
      region: 'ap-guangzhou',
      type: 'Cloud',
      uin,
      rules
    }
  }

  const sdk = getServerlessSdk(instanceYaml.org, appId)

  it('deploy eventbridge with rules', async () => {
    const instance = await sdk.deploy(instanceYaml, credentials)

    expect(instance).toBeDefined()
    expect(instance.instanceName).toEqual(instanceYaml.name)
    expect(instance.region).toEqual(instanceYaml.region)

    expect(instance.state).toBeDefined()
    expect(instance.outputs).toBeDefined()
    const { outputs, state } = instance

    expect(state.eventBusName).toEqual(instanceYaml.inputs.eventBusName)
    expect(outputs.eventBusId).toBeDefined()
    expect(outputs.description).toBeDefined()
    expect(outputs.uin).toEqual(instanceYaml.inputs.uin)
    expect(outputs.type).toEqual(instanceYaml.inputs.type)

    expect(outputs.connections).toBeDefined()
    expect(outputs.connections).toHaveLength(1)

    expect(outputs.rules).toBeDefined()
    expect(outputs.rules).toHaveLength(1)
    expect(outputs.rules[0].ruleName).toEqual(instanceYaml.inputs.rules[0].ruleName)
    expect(outputs.rules[0].eventPattern).toEqual(instanceYaml.inputs.rules[0].eventPattern)
    expect(outputs.rules[0].type).toEqual(CONFIGS.rule.type)
    expect(outputs.rules[0].targets).toHaveLength(1)
    expect(outputs.rules[0].targets[0].type).toEqual(CONFIGS.rule.targetType)
    expect(outputs.rules[0].targets[0].functionName).toEqual(
      instanceYaml.inputs.rules[0].targets[0].functionName
    )
    expect(outputs.rules[0].targets[0].functionNamespace).toEqual(
      instanceYaml.inputs.rules[0].targets[0].functionNamespace
    )
    expect(outputs.rules[0].targets[0].functionVersion).toEqual(
      instanceYaml.inputs.rules[0].targets[0].functionVersion
    )
  })

  it('remove eventbridge with rules', async () => {
    await sdk.remove(instanceYaml, credentials)
    const result = await sdk.getInstance(
      instanceYaml.org,
      instanceYaml.stage,
      instanceYaml.app,
      instanceYaml.name
    )

    expect(result.instance.instanceStatus).toEqual('inactive')
  })

  // 测试账号无固定网关服务，以下仅以个人账号单独测试验证。
  // it('deploy eventbridge with connections & rules', async () => {
  //   instanceYaml.inputs.connections = connections
  //   const instance = await sdk.deploy(instanceYaml, credentials)
  //   expect(instance).toBeDefined()
  //   expect(instance.instanceName).toEqual(instanceYaml.name)
  //   expect(instance.region).toEqual(instanceYaml.region)

  //   expect(instance.state).toBeDefined()
  //   expect(instance.outputs).toBeDefined()
  //   const { outputs, state } = instance

  //   expect(state.eventBusName).toEqual(instanceYaml.inputs.eventBusName)
  //   expect(outputs.eventBusId).toBeDefined()
  //   expect(outputs.description).toBeDefined()
  //   expect(outputs.uin).toEqual(instanceYaml.inputs.uin)
  //   expect(outputs.type).toEqual(instanceYaml.inputs.type)

  //   expect(outputs.connections).toBeDefined()
  //   expect(outputs.connections).toHaveLength(1)
  //   expect(outputs.connections[0].connectionId).toBeDefined()
  //   instanceYaml.inputs.connections[0].connectionId = outputs.connections[0].connectionId
  //   expect(outputs.connections[0].connectionName).toEqual(connections[0].connectionName)
  //   expect(outputs.connections[0].type).toEqual(CONFIGS.connection.type)
  //   expect(outputs.connections[0].serviceId).toEqual(connections[0].serviceId)
  //   expect(outputs.connections[0].method).toEqual(connections[0].method)

  //   expect(outputs.rules).toBeDefined()
  //   expect(outputs.rules).toHaveLength(1)
  //   expect(outputs.rules[0].ruleName).toEqual(instanceYaml.inputs.rules[0].ruleName)
  //   expect(outputs.rules[0].eventPattern).toEqual(instanceYaml.inputs.rules[0].eventPattern)
  //   expect(outputs.rules[0].type).toEqual(CONFIGS.rule.type)
  //   expect(outputs.rules[0].targets).toHaveLength(1)
  //   expect(outputs.rules[0].targets[0].type).toEqual(CONFIGS.rule.targetType)
  //   expect(outputs.rules[0].targets[0].functionName).toEqual(
  //     instanceYaml.inputs.rules[0].targets[0].functionName
  //   )
  //   expect(outputs.rules[0].targets[0].functionNamespace).toEqual(
  //     instanceYaml.inputs.rules[0].targets[0].functionNamespace
  //   )
  //   expect(outputs.rules[0].targets[0].functionVersion).toEqual(
  //     instanceYaml.inputs.rules[0].targets[0].functionVersion
  //   )
  // })

  // it('update eventbridge connections', async () => {
  //   instanceYaml.inputs.connections[0].connectionName = 'new-eb-conn'
  //   const instance = await sdk.deploy(instanceYaml, credentials)
  //   expect(instance).toBeDefined()
  //   expect(instance.instanceName).toEqual(instanceYaml.name)
  //   expect(instance.region).toEqual(instanceYaml.region)

  //   expect(instance.state).toBeDefined()
  //   expect(instance.outputs).toBeDefined()
  //   const { outputs, state } = instance

  //   expect(state.eventBusName).toEqual(instanceYaml.inputs.eventBusName)
  //   expect(outputs.eventBusId).toBeDefined()
  //   expect(outputs.description).toBeDefined()
  //   expect(outputs.uin).toEqual(instanceYaml.inputs.uin)
  //   expect(outputs.type).toEqual(instanceYaml.inputs.type)

  //   expect(outputs.connections).toBeDefined()
  //   expect(outputs.connections).toHaveLength(1)
  //   expect(outputs.connections[0].connectionId).toBeDefined()
  //   expect(outputs.connections[0].connectionName).toEqual('new-eb-conn')
  //   expect(outputs.connections[0].type).toEqual(CONFIGS.connection.type)
  //   expect(outputs.connections[0].serviceId).toEqual(connections[0].serviceId)
  //   expect(outputs.connections[0].method).toEqual(connections[0].method)

  //   expect(outputs.rules).toBeDefined()
  //   expect(outputs.rules).toHaveLength(1)
  // })

  // it('remove eventbridge with connections & rules', async () => {
  //   await sdk.remove(instanceYaml, credentials)
  //   const result = await sdk.getInstance(
  //     instanceYaml.org,
  //     instanceYaml.stage,
  //     instanceYaml.app,
  //     instanceYaml.name
  //   )

  //   expect(result.instance.instanceStatus).toEqual('inactive')
  // })
})
