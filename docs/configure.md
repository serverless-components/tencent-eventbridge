# 配置文档

## 完整配置

```yml
# serverless.yml

org: orgDemo #（可选） 用于记录组织信息，默认值为您的腾讯云账户 appid
app: appDemo #（可选） 该应用名称
stage: dev #（可选） 用于区分环境信息，默认值为 dev
component: eventbridge # (必填) 组件名称，此处为 eventbridge
name: ebDemo # (必填) 实例名称

inputs:
  eventBusId: eb-8dsikiq8
  eventBusName: sls-eb
  description: 'serverless service of event bridge'
  region: ap-guangzhou
  type: Cloud
  uin: 123456789 # 腾讯云账号 ID
  # 连接器为空时，默认创建一个  API 网关服务作为连接器
  connections:
    - connectionId: connector-e8qav123
      connectionName: abcdefg
      enable: true
      serviceId: service-13245678 # API 网关服务 ID
      method: POST
  rules:
    - ruleId: rule-pk2tx0o8
      ruleName: sls-eb-rule
      eventPattern: '{\n  "source": ["apigw.cloud.tencent"]\n}'
      type: Cloud # 同最外层eb类型
      description: 'eb rule desc'
      enable: true
      targets:
        - functionName: scf-13245678
          functionNamespace: default
          functionVersion: '$DEFAULT'
```

## 配置说明

### 主要函数说明

| 参数         | 必选 |          参数类型           |     默认值      | 描述                                                                                |
| ------------ | :--: | :-------------------------: | :-------------: | :---------------------------------------------------------------------------------- |
| eventBusId   |  否  |           string            |                 | 事件集 ID                                                                           |
| region       |  是  |           string            | `ap-guangzhou`  | 事件集的部署区域                                                                    |
| eventBusName |  是  |           string            | `serverless-eb` | 事件集名称                                                                          |
| uin          |  是  |           string            |                 | 用户腾讯云账号的账号 ID [查看账号信息](https://console.cloud.tencent.com/developer) |
| description  |  否  |           string            |                 | 用户自定义的事件集描述说明                                                          |
| type         |  否  |           string            |     `Cloud`     | 指定事件集类型，`Cloud` 为云服务事件集，`Custom` 为自定义事件集。                   |
| connections  |  否  | [Connection](#Connection)[] |                 | 事件集需绑定的事件连接器列表，用于事件(数据)源接入                                  |
| rules        |  是  |       [Rule](#Rule)[]       |                 | 事件规则列表，用于过滤和转换事件                                                    |

### Connection

事件连接器参数说明

| 参数           | 必选 |  类型   |     默认值      | 描述                                |
| -------------- | :--: | :-----: | :-------------: | :---------------------------------- |
| connectionId   |  否  | string  |                 | 连接器 的唯一 ID                    |
| connectionName |  是  | string  | `eb-connection` | 连接器名称                          |
| serviceId      |  是  | string  |                 | API 网关服务 ID                     |
| method         |  是  | string  |     `POST`      | API 网关服务的请求方法              |
| enable         |  否  | boolean |     `true`      | 是否启用该连接器                    |
| type           |  否  | string  |     `apigw`     | 连接器类型，目前仅支持 API 网关类型 |

### Rule

事件规则参数配置

| 参数         | 必选 |        类型         |                   默认值                   | 描述                                                                                    |
| ------------ | :--: | :-----------------: | :----------------------------------------: | :-------------------------------------------------------------------------------------- |
| ruleId       |  否  |       string        |                                            | 事件规则 ID                                                                             |
| ruleName     |  是  |       string        |               `sls-eb-rule`                | 事件规则名称                                                                            |
| eventPattern |  是  |       string        | `{\n "source": ["apigw.cloud.tencent"]\n}` | 事件模式，不建议修改。[说明文档](https://cloud.tencent.com/document/product/1359/56084) |
| type         |  否  |       string        |                  `Cloud`                   | 事件规则类型，支持云服务和自定义，与事件集类型相同                                      |
| description  |  否  |       string        |                                            | 事件规则描述说明                                                                        |
| enable       |  否  |       string        |                   `true`                   | 是否启用该事件规则                                                                      |
| targets      |  是  | [Target](#Target)[] |                                            | 事件目标列表                                                                            |

### Target

事件目标参数配置

| 参数              | 必选 |  类型  |   默认值   | 描述                                                |
| ----------------- | :--: | :----: | :--------: | :-------------------------------------------------- |
| functionName      |  是  | string |            | 目标云函数名称                                      |
| functionNamespace |  是  | string | `default`  | 目标云函数命名空间                                  |
| functionVersion   |  是  | string | `$DEFAULT` | 目标云函数版本及别名，可选：`$DEFAULT` 或 `$LATEST` |
