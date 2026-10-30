@allowed([
  'dev'
  'test'
])
param environment string = 'dev'
var resourceName = 'app-${environment}'
output plannedName string = resourceName
