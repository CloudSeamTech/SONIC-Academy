param environment string = 'dev'
module network './network.bicep' = {
  name: 'network-${environment}'
  params: { prefix: 'cs-${environment}' }
}
output appSubnetId string = network.outputs.subnetId
