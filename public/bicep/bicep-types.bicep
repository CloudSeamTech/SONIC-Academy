param serverCount int = 2
param enableFeature bool = false
param teams array = ['apps', 'ops']
var settings = {
  environment: 'dev'
  owner: 'training'
}
output plan object = { count: serverCount, enabled: enableFeature, teams: teams, settings: settings }
