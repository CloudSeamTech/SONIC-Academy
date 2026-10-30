param location string = resourceGroup().location
param prefix string = 'cs-dev'
resource nsg 'Microsoft.Network/networkSecurityGroups@2024-05-01' = {
  name: '${prefix}-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'DenyInboundByDefault'
        properties: {
          priority: 4096
          direction: 'Inbound'
          access: 'Deny'
          protocol: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}
resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: '${prefix}-vnet'
  location: location
  properties: {
    addressSpace: { addressPrefixes: ['10.42.0.0/16'] }
    subnets: [
      {
        name: 'apps'
        properties: {
          addressPrefix: '10.42.1.0/24'
          networkSecurityGroup: { id: nsg.id }
        }
      }
    ]
  }
}
output subnetId string = vnet.properties.subnets[0].id

@minValue(1)
@maxValue(3)
param serverCount int = 2
param adminUsername string = 'azureuser'
@secure()
param sshPublicKey string
resource nics 'Microsoft.Network/networkInterfaces@2024-05-01' = [for i in range(0, serverCount): {
  name: '${prefix}-nic-${i + 1}'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'private-ip'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: { id: vnet.properties.subnets[0].id }
        }
      }
    ]
  }
}]
resource vms 'Microsoft.Compute/virtualMachines@2024-07-01' = [for i in range(0, serverCount): {
  name: '${prefix}-vm-${i + 1}'
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    hardwareProfile: { vmSize: 'Standard_B2s' }
    osProfile: {
      computerName: '${prefix}-vm-${i + 1}'
      adminUsername: adminUsername
      customData: base64(loadTextContent('cloud-init.yml'))
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: 'ubuntu-24_04-lts'
        sku: 'server'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        managedDisk: { storageAccountType: 'Standard_LRS' }
      }
    }
    networkProfile: {
      networkInterfaces: [ { id: nics[i].id } ]
    }
  }
}]
output vmNames array = [for i in range(0, serverCount): vms[i].name]
