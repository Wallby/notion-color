param(
    [string]$command
)

function Add-Folder
{
    param(
        [string]$Path
    )

    if(!(Test-Path -PathType Container $Path))
    {
        New-Item -ItemType Directory $Path
    }
}
function Prompt-To-Write-File
{
    param(
        [string]$Path
    )
    if(Test-Path -PathType Leaf $edgePath)
    {
        while($true)
        {
            Write-Host "$edgePath already exists, overwrite it? y/n: " -NoNewline
            $answer = $Host.UI.ReadLine()
            switch($answer)
            {
                "y" { return $true, $true; }
                "n" { return $true, $false; }
                default { Write-Host "Invalid response $answer"}
            }
        }
    }
    return $false, $true;
}

$manifest = Get-Content "extension/manifest.json" | ConvertFrom-Json
Write-Host "Manifest version: $($manifest.version)"
$edgePath = ".build/Edge/notion-color-$($manifest.version).zip"

function Clean-Item
{
    param(
        $Path
    )

    if(Test-Path $Path)
    {
        Remove-Item $Path
        Write-Host "Removed $Path"
    }
}

switch($command)
{
    "Clean"
    {
        Clean-Item $edgePath
        Remove-Item -Recurse ".build"
    }
    ""
    {
        Add-Folder ".build" | Out-Null
        Add-Folder ".build/Edge" | Out-Null

        $exists, $write = Prompt-To-Write-File $edgePath
        if($write)
        {
            $options = @()
            if($exists)
            {
                $options = @{ Update = $true }
            }
            Compress-Archive -Path extension\* -DestinationPath $edgePath @options
            Write-Host "Output $edgePath"
        }
        Write-Host "Done"
    }
    default { Write-Host "Unknown command $command" }
}