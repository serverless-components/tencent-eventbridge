const CONFIGS = {
  compName: 'eventbridge',
  compFullname: 'EventBridge',
  region: 'ap-guangzhou',
  eventBusName: 'serverless-eb',
  type: 'Cloud', // 事件集类型，支持云服务(Cloud)和自定义（Custom），默认为Cloud
  description: 'Created by Serverless Component',
  connection: {
    connectionName: 'eb-connection',
    enable: true,
    type: 'apigw' // 消息队列(TDMQ)类型的连接器暂不支持
  },
  rule: {
    ruleName: 'sls-eb-rule',
    eventPattern: '{\n  "source": ["apigw.cloud.tencent"]\n}',
    type: 'Cloud',
    enable: true,
    description: 'serverless event bridge rule',
    targetType: 'scf', // 触发目标仅支持云函数
    targetFuncNamespace: 'default',
    targetFucnVersion: '$DEFAULT' // 仅支持版本:$LATEST，别名:$DEFAULT
  }
}

module.exports = CONFIGS
