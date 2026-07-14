$ErrorActionPreference = 'Stop'

# Parse students
$students = @{}
$studentLines = Get-Content -Path "d:\p\students.txt" | Select-Object -Skip 1

foreach ($line in $studentLines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line -split "`t"
    if ($parts.Length -ge 3) {
        $roll = $parts[0].Trim().ToLower()
        $name = $parts[1].Trim()
        $email = $parts[2].Trim()
        
        $students[$roll] = @{
            name = $name
            github = "githubusername"
            team = ""
            joinedAt = "2026-07-14"
        }
    }
}

# Parse teams
$teamsData = @{}
for ($i = 1; $i -le 7; $i++) {
    $teamsData["team$i"] = @{
        members = @()
    }
}

$teamContent = Get-Content -Path "d:\p\teams.txt" -Raw
# Replace carriage returns for uniform split
$teamContent = $teamContent -replace "`r", ""
$teamBlocks = $teamContent -split "\n(?=\d+\t)"

foreach ($block in $teamBlocks) {
    if ([string]::IsNullOrWhiteSpace($block)) { continue }
    
    # Extract the team number
    if ($block -match "^(\d+)\t") {
        $smallTeamNum = [int]$Matches[1]
        
        # Calculate large team (1,2,3 -> 1; 4,5,6 -> 2; etc.)
        $largeTeamNum = [math]::Ceiling($smallTeamNum / 3.0)
        $largeTeamId = "team$largeTeamNum"
        
        # Extract roll numbers (anything matching 25MX\d{3} case-insensitive)
        $matches = [regex]::Matches($block, "(?i)25MX\d{3}")
        foreach ($m in $matches) {
            $roll = $m.Value.ToLower()
            if ($teamsData[$largeTeamId].members -notcontains $roll) {
                $teamsData[$largeTeamId].members += $roll
            }
            
            # Update student's team in roster
            if ($students.ContainsKey($roll)) {
                $students[$roll].team = $largeTeamId
            }
        }
    }
}

# Convert roster to JSON manually or using ConvertTo-Json
$rosterJson = $students | ConvertTo-Json -Depth 3 -Compress
# Uncompressing it nicely using PowerShell trick or just outputting raw. We can format it manually for neatness:
$rosterJsonFormatted = $students | ConvertTo-Json -Depth 3
Set-Content -Path "d:\p\placement-readiness\students\roster.json" -Value $rosterJsonFormatted -Encoding UTF8

$teamsJsonFormatted = $teamsData | ConvertTo-Json -Depth 3
Set-Content -Path "d:\p\placement-readiness\teams.json" -Value $teamsJsonFormatted -Encoding UTF8

# Build attendance and scoreboard
$attendance = @{}
$scoreboard = @{}

foreach ($key in $students.Keys) {
    $attendance[$key] = @{}
    $scoreboard[$key] = @{
        byDay = @{}
    }
}

$attJson = $attendance | ConvertTo-Json -Depth 3
Set-Content -Path "d:\p\placement-readiness\attendance.json" -Value $attJson -Encoding UTF8

$scoreJson = $scoreboard | ConvertTo-Json -Depth 3
Set-Content -Path "d:\p\placement-readiness\scoreboard.json" -Value $scoreJson -Encoding UTF8

Write-Host "Processed $($students.Count) students."
Write-Host "Done formatting data."
