# Optional: turn your reviewed plan into Azure resources

This is a local PowerShell exercise. The website does not execute it.
VMs, disks and network services can incur charges. Continue only with the required
subscription permissions, budget and approval for an empty disposable training group.
The class example creates private Ubuntu VMs. It provides no inbound management
access and no explicit internet egress. Plan approved access and outbound connectivity
before expecting software installation or an application to work.

## 1. Save exactly the files you will review

In the capstone workbench choose Download main.bicep. Save it as
`Documents\CloudSeam-Bicep\main.bicep` on your workstation.
If using the software example, save its `cloud-init.yml` beside it too.
Open VS Code → File → Open Folder → CloudSeam-Bicep → Terminal → New Terminal.
Choose PowerShell. Get-Location must show that folder.

The displayed prompt is `PS C:\Users\YourName\Documents\CloudSeam-Bicep>`.
Type only each command below, without that prompt.

```powershell
Get-Location
az bicep version
az bicep build --file .\main.bicep
```

Expected: main.json is emitted; review every warning. Do not continue with errors.
Record the source version and compiler version in your notebook.

## 2. Identify the subscription and group before changing anything

Sign in locally with `az login` if needed. Use Microsoft's sign-in flow, not this website.
An authorized lab owner must supply the subscription ID and an existing empty training
resource group. Do not guess from a similar name. These commands only inspect scope.

```powershell
az account show --query "{name:name,id:id}" --output table
$trainingGroup = Read-Host 'Approved empty training resource-group name'
az group show --name $trainingGroup --query "{id:id,location:location}" --output table
az resource list --resource-group $trainingGroup --query "[].{name:name,type:type}" --output table
```

`$trainingGroup` is an input you choose; every later command reuses that exact value.
Stop on an incorrect subscription/group or unexpected existing resources. If you need
to change subscriptions, obtain the approved ID and use `az account set --subscription ID`,
then run the account/group checks again. Do not request broader access to bypass a failure.

## 3. Supply a public key, never a private key

Use an approved SSH public key for this disposable lab. It is the file ending in `.pub`.
If you do not have one, ask the lab owner about the organization's key requirements.
For a permitted new training key, check that the destination does not already exist,
then run this locally (choose a different new filename if it does):

```powershell
Test-Path "$HOME\.ssh\cloudseam-bicep"
ssh-keygen -t rsa -b 4096 -f "$HOME\.ssh\cloudseam-bicep"
```

Expected from Test-Path: False before creating a new key. Never overwrite an existing
private key. Enter any passphrase only into the local key-generation prompt.
Keep the private key on your workstation; do not upload it or put it in the notebook.

```powershell
$publicKeyPath = Read-Host 'Full path to the approved .pub file'
$publicKey = (Get-Content -LiteralPath $publicKeyPath -Raw).Trim()
```

Expected: you selected a public-key file, not a PEM/private-key block. The public key
is an input; the VM names and resource IDs are derived from other inputs.

## 4. Ask Azure to validate and preview the exact inputs

Use the same main.bicep and parameters for both checks and the later deployment.
The example limits serverCount to 1–3; begin with 1 to reduce the training footprint.

```powershell
az deployment group validate --resource-group $trainingGroup --template-file .\main.bicep --parameters serverCount=1 sshPublicKey="$publicKey"
az deployment group what-if --resource-group $trainingGroup --template-file .\main.bicep --parameters serverCount=1 sshPublicKey="$publicKey"
```

Expected: validation succeeds and the preview proposes only your reviewed training
resources. Read Create/Modify/Delete/NoChange and unresolved values. This is more
evidence than compilation, but is not a guarantee of a future successful deployment.
Stop for unexpected changes, policy, access, name, image, regional capacity or quota
errors. Correct the approved design and rerun both checks; do not bypass policy.

## 5. Optional real deployment — only after the required approval

This next command creates or updates resources and can incur charges. Confirm the
scope, proposed resources and cost approval immediately before running it locally.
Keep the same inputs you validated. Save the returned deployment name and result.

```powershell
az deployment group create --name cloudseam-bicep-practice --resource-group $trainingGroup --template-file .\main.bicep --parameters serverCount=1 sshPublicKey="$publicKey"
```

Expected: deployment provisioningState is Succeeded. A failed operation requires
inspection; do not call the class successful simply because the command returned.

```powershell
az deployment group show --name cloudseam-bicep-practice --resource-group $trainingGroup --query "{state:properties.provisioningState,outputs:properties.outputs}"
az vm list --resource-group $trainingGroup --query "[].{name:name,state:provisioningState}" --output table
az network nic list --resource-group $trainingGroup --query "[].{name:name,state:provisioningState}" --output table
```

Then inspect the VNet/apps subnet, NSG association, private NICs and managed disks in
Azure Portal. The template contains no public-IP resource. Verify guest configuration
through an approved private management route. For the software exercise, check
cloud-init status, the NGINX service and localhost HTTP inside the guest. No route
or package access means these runtime checks may fail even when the VM exists.

## 6. Recover and clean up deliberately

For failure details use Azure Portal → Resource groups → your verified group →
Deployments → cloudseam-bicep-practice → Operation details. Record the error and
affected resource. Reverting Git does not automatically reverse deployed state.
Review the corrected source with validate and what-if before retrying. Preserve
needed data before any replacement or deletion.

For an approved disposable lab, rerun the account/group/resource-list checks from
step 2, verify the exact group ID with the lab owner, and preserve needed evidence.
Only then, if deletion is authorized, run:

```powershell
az group delete --name $trainingGroup
```

Read and answer Azure CLI's confirmation yourself. Do not add --yes as a shortcut.
Deletion is destructive. Never run it on a shared or production group. Confirm deletion
in the portal and review retained resources/billing according to the lab's process.
Stopping a VM alone does not remove its disks or all other billable resources.

References:
- https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-cli
- https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if
- https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access
- https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-keys-detailed
