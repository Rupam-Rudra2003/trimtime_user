#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function usage() {
    console.log('Usage: node scripts/addSalonTranslations.js --id <slug> --name "Name in default lang" [--address "Address"] [--hi "Hindi name"] [--bn "Bengali name"]')
    process.exit(1)
}

const args = process.argv.slice(2)
if (args.length === 0) usage()

const params = {}
for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
        const key = a.slice(2)
        const val = args[i + 1]
        if (!val || val.startsWith('--')) { params[key] = true } else { params[key] = val;
            i++ }
    }
}

if (!params.id || !params.name) usage()

const localesDir = path.join(__dirname, '..', 'src', 'locales')
if (!fs.existsSync(localesDir)) {
    console.error('Locales directory not found:', localesDir)
    process.exit(2)
}

const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'))
if (localeFiles.length === 0) {
    console.error('No locale JSON files found in', localesDir)
    process.exit(3)
}

const id = params.id
const defaultName = params.name
const address = params.address || ''

localeFiles.forEach(file => {
    const filePath = path.join(localesDir, file)
    try {
        const raw = fs.readFileSync(filePath, 'utf8')
        const json = JSON.parse(raw)
        if (!json.data) json.data = {}
        if (!json.data.salons) json.data.salons = {}
            // prepare values: prefer locale-specific param if provided, else fallback to defaultName
        const lang = path.basename(file, '.json')
        const localizedName = params[lang] || defaultName
        const localizedAddress = params[`${lang}_address`] || address
        json.data.salons[id] = json.data.salons[id] || {}
        json.data.salons[id].name = localizedName
        json.data.salons[id].address = localizedAddress
            // write back with 2-space indent
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8')
        console.log(`Updated ${file} -> data.salons.${id}.name = "${localizedName}"`)
    } catch (e) {
        console.error('Failed to update', filePath, e.message)
    }
})

console.log('Done.')