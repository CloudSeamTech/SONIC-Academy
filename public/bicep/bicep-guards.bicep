@minValue(1)
@maxValue(3)
param serverCount int = 2
@allowed(['dev', 'test'])
param environment string = 'dev'
@secure()
param adminPassword string
output count int = serverCount
