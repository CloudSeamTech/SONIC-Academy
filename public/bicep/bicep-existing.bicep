param existingNsgName string = 'cs-dev-nsg'
resource existingNsg 'Microsoft.Network/networkSecurityGroups@2024-05-01' existing = {
  name: existingNsgName
}
output expectedNsgId string = existingNsg.id
