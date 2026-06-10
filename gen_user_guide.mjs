import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, PageNumber, PageBreak, TableOfContents,
} from '/sessions/quirky-sweet-darwin/tmp/lib/node_modules/docx/dist/index.mjs'
import fs from 'fs'

const BRAND="1A5FA8", ACCENT="0082C8", WHITE="FFFFFF"
const LGRAY="E8EEF4", MGRAY="C4CDD6", DGRAY="5A6A7A"
const WARN="F59E0B", INFO="0EA5E9", DANGER="EF4444"
const PAGE_W=11906, CONT_W=9026
const MARGIN={top:1440,bottom:1440,left:1440,right:1440}

function spacer(before=160){return new Paragraph({children:[],spacing:{before,after:0}})}
function bold(text,color="333333",size=22){return new TextRun({text,bold:true,size,font:"Arial",color})}
function code(text){return new TextRun({text,font:"Courier New",size:20,color:ACCENT})}

const cBord={style:BorderStyle.SINGLE,size:1,color:MGRAY}
const cBords={top:cBord,bottom:cBord,left:cBord,right:cBord}

function tRow(cells,hdr=false){
  return new TableRow({
    tableHeader:hdr,
    children:cells.map(function(c){
      return new TableCell({
        width:{size:c.w,type:WidthType.DXA},
        shading:hdr?{fill:BRAND,type:ShadingType.CLEAR}:(c.bg?{fill:c.bg,type:ShadingType.CLEAR}:undefined),
        borders:cBords,
        margins:{top:80,bottom:80,left:120,right:120},
        children:[new Paragraph({spacing:{before:0,after:0},children:[
          new TextRun({text:c.text,size:20,font:"Arial",bold:hdr,color:hdr?WHITE:"333333"})
        ]})]
      })
    })
  })
}

function note(text,type){
  type=type||"info"
  var bg=type==="warn"?"FFF8E6":type==="danger"?"FEE2E2":"E0F2FE"
  var lc=type==="warn"?WARN:type==="danger"?DANGER:INFO
  var b={style:BorderStyle.SINGLE,size:8,color:lc}
  var nb={style:BorderStyle.NIL,size:0,color:"FFFFFF"}
  var icon=type==="warn"?"NOTE:":type==="danger"?"WARN:":"INFO:"
  return new Table({
    width:{size:CONT_W,type:WidthType.DXA},columnWidths:[600,CONT_W-600],
    rows:[new TableRow({children:[
      new TableCell({width:{size:600,type:WidthType.DXA},shading:{fill:bg,type:ShadingType.CLEAR},
        margins:{top:80,bottom:80,left:120,right:80},borders:{top:b,bottom:b,left:b,right:nb},
        children:[new Paragraph({spacing:{before:0,after:0},children:[new TextRun({text:icon,size:20,bold:true,font:"Arial",color:lc})]})]
      }),
      new TableCell({width:{size:CONT_W-600,type:WidthType.DXA},shading:{fill:bg,type:ShadingType.CLEAR},
        margins:{top:80,bottom:80,left:80,right:120},borders:{top:b,bottom:b,left:nb,right:b},
        children:[new Paragraph({spacing:{before:0,after:0},children:[new TextRun({text:text,size:20,font:"Arial",color:"333333"})]})]
      }),
    ]})]
  })
}

function banner(text){
  var b={style:BorderStyle.SINGLE,size:1,color:ACCENT}
  return new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[CONT_W],
    rows:[new TableRow({children:[new TableCell({
      width:{size:CONT_W,type:WidthType.DXA},
      shading:{fill:BRAND,type:ShadingType.CLEAR},
      margins:{top:160,bottom:160,left:240,right:240},
      borders:{top:b,bottom:b,left:b,right:b},
      children:[new Paragraph({spacing:{before:0,after:0},children:[
        new TextRun({text:text,size:32,bold:true,color:WHITE,font:"Arial"})
      ]})]
    })})]
  })
}

function h(text,level,opts){
  opts=opts||{}
  var sizes=[0,36,30,26,24]
  var colors=[0,BRAND,ACCENT,"222222","444444"]
  var befores=[0,360,300,240,200]
  var afters=[0,160,120,100,80]
  var hls=[0,HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3,HeadingLevel.HEADING_4]
  return new Paragraph({
    heading:hls[level],
    spacing:{before:opts.before||befores[level],after:opts.after||afters[level]},
    children:[new TextRun({text:text,bold:true,size:sizes[level],color:colors[level],font:"Arial"})],
  })
}

function para(text,opts){
  opts=opts||{}
  var runs=typeof text==="string"
    ?[new TextRun({text:text,size:22,font:"Arial",color:"333333"})]
    :text
  return new Paragraph({children:runs,spacing:{before:80,after:120},...opts})
}

function bullet(text,level){
  level=level||0
  return new Paragraph({
    numbering:{reference:"bullets",level:level},
    spacing:{before:60,after:60},
    children:[new TextRun({text:text,size:22,font:"Arial",color:"333333"})],
  })
}

function numbered(text,level){
  level=level||0
  return new Paragraph({
    numbering:{reference:"numbers",level:level},
    spacing:{before:60,after:60},
    children:[new TextRun({text:text,size:22,font:"Arial",color:"333333"})],
  })
}

var pb = new Paragraph({children:[new PageBreak()]})

var doc=new Document({
  numbering:{config:[
    {reference:"bullets",levels:[
      {level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}},
      {level:1,format:LevelFormat.BULLET,text:"-",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:1080,hanging:360}}}},
    ]},
    {reference:"numbers",levels:[
      {level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}},
      {level:1,format:LevelFormat.DECIMAL,text:"%1.%2.",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:1080,hanging:360}}}},
    ]},
  ]},
  styles:{
    default:{document:{run:{font:"Arial",size:22,color:"333333"}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:36,bold:true,font:"Arial",color:BRAND},
        paragraph:{spacing:{before:360,after:160},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:30,bold:true,font:"Arial",color:ACCENT},
        paragraph:{spacing:{before:300,after:120},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:26,bold:true,font:"Arial",color:"222222"},
        paragraph:{spacing:{before:240,after:100},outlineLevel:2}},
    ]
  },
  sections:[
    // === COVER PAGE ===
    {
      properties:{page:{size:{width:PAGE_W,height:16838},margin:MARGIN}},
      children:[
        spacer(1000),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[CONT_W],
          rows:[new TableRow({children:[new TableCell({
            width:{size:CONT_W,type:WidthType.DXA},
            shading:{fill:BRAND,type:ShadingType.CLEAR},
            margins:{top:480,bottom:480,left:480,right:480},
            borders:{top:{style:BorderStyle.SINGLE,size:8,color:ACCENT},bottom:{style:BorderStyle.SINGLE,size:8,color:ACCENT},left:{style:BorderStyle.SINGLE,size:4,color:ACCENT},right:{style:BorderStyle.SINGLE,size:4,color:ACCENT}},
            children:[
              new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:60},children:[new TextRun({text:"MarineElect",size:64,bold:true,color:WHITE,font:"Arial"})]}),
              new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:80},children:[new TextRun({text:"Ship Electrical Intelligence Platform",size:32,color:"A8C8F0",font:"Arial"})]}),
              new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:0},children:[new TextRun({text:"Complete User Guide & Blueprint",size:26,color:"7BAFD4",font:"Arial",italics:true})]}),
            ],
          })})]
        }),
        spacer(400),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[CONT_W/2,CONT_W/2],rows:[
          tRow([{text:"Document",w:CONT_W/2},{text:"MarineElect User Guide v1.0",w:CONT_W/2}]),
          tRow([{text:"App URL",w:CONT_W/2},{text:"https://marineelect.sujikumar.com",w:CONT_W/2}]),
          tRow([{text:"Technology",w:CONT_W/2},{text:"Next.js 14 | TypeScript | Recharts | localStorage",w:CONT_W/2}]),
          tRow([{text:"Deployment",w:CONT_W/2},{text:"Cloudflare Pages",w:CONT_W/2}]),
          tRow([{text:"Prepared by",w:CONT_W/2},{text:"Sujikumar - sujikumar.com",w:CONT_W/2}]),
        ]}),
        spacer(200),
        new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"For marine electrical engineers & fleet managers",size:20,italics:true,color:DGRAY,font:"Arial"})]}),
        pb,
      ]
    },
    // === MAIN CONTENT ===
    {
      properties:{page:{size:{width:PAGE_W,height:16838},margin:MARGIN}},
      headers:{default:new Header({children:[new Paragraph({
        alignment:AlignmentType.RIGHT,
        border:{bottom:{style:BorderStyle.SINGLE,size:4,color:ACCENT,space:4}},
        spacing:{before:0,after:120},
        children:[new TextRun({text:"MarineElect - Ship Electrical Intelligence Platform",size:18,color:DGRAY,font:"Arial"})]
      })]})},
      footers:{default:new Footer({children:[new Paragraph({
        alignment:AlignmentType.CENTER,
        border:{top:{style:BorderStyle.SINGLE,size:4,color:MGRAY,space:4}},
        spacing:{before:120,after:0},
        children:[
          new TextRun({text:"MarineElect User Guide  |  marineelect.sujikumar.com  |  Page ",size:18,color:DGRAY,font:"Arial"}),
          new TextRun({children:[PageNumber.CURRENT],size:18,color:DGRAY,font:"Arial"}),
        ]
      })]})},
      children:[

        // TABLE OF CONTENTS
        h("Table of Contents",1),
        new TableOfContents("Table of Contents",{hyperlink:true,headingStyleRange:"1-3"}),
        pb,

        // 1. INTRODUCTION
        banner("1.  Introduction"),spacer(120),
        h("1.1  What is MarineElect?",2),
        para("MarineElect is a browser-based Ship Electrical Intelligence Platform designed for marine electrical engineers and fleet managers. It provides a complete multi-vessel workspace where each ship is managed in a fully isolated environment keyed by its IMO number. Engineers can monitor, analyse, and manage the electrical systems of multiple vessels simultaneously with zero data conflicts between vessels."),
        para("The platform covers all critical aspects of shipboard electrical management - from real-time load scheduling and generator management, to cable database maintenance, fault logging with pattern detection, and planned maintenance scheduling. A 90-day trend analysis engine provides historical context for every electrical performance metric."),
        h("1.2  Who Should Use This Guide",2),
        bullet("Marine Electrical Engineers - day-to-day vessel electrical management"),
        bullet("Electrical Superintendents - fleet-wide oversight and comparison"),
        bullet("Fleet Managers - KPI monitoring, fault escalation, maintenance tracking"),
        bullet("New Users - complete onboarding reference for the platform"),
        spacer(100),
        h("1.3  Module Summary",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3000,6026],rows:[
          tRow([{text:"Module",w:3000},{text:"Purpose",w:6026}],true),
          tRow([{text:"Fleet Dashboard",w:3000},{text:"Overview of all vessels - load, faults, overdue tasks, and alert banners",w:6026}]),
          tRow([{text:"Vessel Workspace",w:3000},{text:"Per-vessel isolated environment keyed by IMO number",w:6026}]),
          tRow([{text:"Load Schedule Analysis",w:3000},{text:"Switchboard load table with live kVA, PF calculation, and running totals",w:6026}]),
          tRow([{text:"Generator Management",w:3000},{text:"Online/offline toggle, run-hours tracking, bus load factor, edit specs",w:6026}]),
          tRow([{text:"Cable Database",w:3000},{text:"Full cable register: voltage drop, utilisation %, fault condition tracking",w:6026}]),
          tRow([{text:"Fault Logs",w:3000},{text:"Timestamped faults with severity, acknowledge workflow, recurring detection",w:6026}]),
          tRow([{text:"Maintenance Scheduler",w:3000},{text:"PMS/Class/Survey tasks with overdue alerts and auto-advance on completion",w:6026}]),
          tRow([{text:"90-Day Trends",w:3000},{text:"Charts: active load, gen load%, average PF, weekly fault count",w:6026}]),
          tRow([{text:"Cross-Fleet Compare",w:3000},{text:"Multi-vessel comparison table and fleet health radar chart",w:6026}]),
        ]}),spacer(120),
        h("1.4  Technology Stack",2),
        bullet("Next.js 14 App Router with static export for Cloudflare Pages"),
        bullet("TypeScript - fully typed data models throughout"),
        bullet("Recharts - all trend and comparison charts"),
        bullet("localStorage - all data stored client-side under the key marineelect-v1"),
        bullet("Cloudflare Pages - deployed globally at marineelect.sujikumar.com"),
        spacer(100),
        note("MarineElect uses browser localStorage for all data. Everything lives in your browser on the device you use. There is no server, no database, and no login. Clearing browser data or using a different device shows a fresh state. See Section 7 for backup and restore instructions.","info"),
        spacer(200),pb,

        // 2. GETTING STARTED
        banner("2.  Getting Started"),spacer(120),
        h("2.1  Accessing the Application",2),
        para([new TextRun({text:"https://marineelect.sujikumar.com",size:26,bold:true,color:ACCENT,font:"Arial"})]),
        para("Open any modern browser and navigate to the URL above. No installation, no login, no account required. Works on desktop, tablet, and mobile."),
        h("2.2  First Launch - Demo Data",2),
        para("On first visit, if no fleet data exists, MarineElect automatically loads two demo vessels so you can explore all features immediately:"),spacer(80),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2400,2000,2400,2226],rows:[
          tRow([{text:"Vessel Name",w:2400},{text:"IMO",w:2000},{text:"Type",w:2400},{text:"Flag",w:2226}],true),
          tRow([{text:"MV Pacific Star",w:2400},{text:"9876543",w:2000},{text:"General Cargo",w:2400},{text:"Panama",w:2226}]),
          tRow([{text:"MV Atlantic Spirit",w:2400},{text:"9234567",w:2000},{text:"Chemical Tanker",w:2400},{text:"Marshall Islands",w:2226}]),
        ]}),spacer(100),
        para("Both demo vessels contain realistic data across all modules - switchboards, generators, cables, fault logs, maintenance schedules, and 90 days of trend history. You can edit or delete them at any time."),
        h("2.3  Navigation Overview",2),
        bullet("Top Navigation Bar - always visible. Contains the MarineElect logo, Fleet link (dashboard), and Compare link (cross-fleet page)."),
        bullet("Vessel Sidebar - appears when you open a vessel workspace. Contains links to all 7 vessel modules. On mobile it collapses into a hamburger icon."),
        spacer(200),pb,

        // 3. FLEET DASHBOARD
        banner("3.  Fleet Dashboard"),spacer(120),
        h("3.1  Overview",2),
        para("The Fleet Dashboard is the home page (URL: /). It shows every vessel's electrical health at a glance - load percentage, open faults, overdue tasks, and quick-access cards."),
        h("3.2  Fleet KPI Cards",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2200,6826],rows:[
          tRow([{text:"KPI",w:2200},{text:"Meaning",w:6826}],true),
          tRow([{text:"Total Vessels",w:2200},{text:"Number of vessels currently in the fleet",w:6826}]),
          tRow([{text:"Open Faults",w:2200},{text:"Total unacknowledged fault logs across all vessels (red if > 0)",w:6826}]),
          tRow([{text:"Overdue Tasks",w:2200},{text:"Total maintenance tasks past their due date across all vessels (amber if > 0)",w:6826}]),
          tRow([{text:"Avg Load %",w:2200},{text:"Average generator load factor across all vessels. Formula: active kW / (online kVA x 0.8) x 100",w:6826}]),
        ]}),spacer(120),
        h("3.3  Alert Banner",2),
        para("If any vessel has open faults or overdue maintenance, a red alert banner appears below the KPIs listing how many vessels need attention."),
        h("3.4  Vessel Cards",2),
        para("Each vessel shows: name, IMO, type, flag; a colour-coded Generator Load bar (green <70%, amber 70-85%, red >85%); Active kW and Gen kVA; and status badges (red for open faults, amber for overdue, green for All Clear)."),
        h("3.5  How to Add a New Vessel",2),
        numbered("Click Add Vessel (top right of the dashboard)"),
        numbered("Fill in the modal form:"),
        bullet("IMO Number - 7-digit official IMO number (required, used as the unique workspace key)",1),
        bullet("Vessel Name - full name e.g. MV Atlantic Hope (required)",1),
        bullet("Flag State - country of registry",1),
        bullet("Vessel Type - select from 12 types (General Cargo, Container, Tanker, Chemical Tanker, etc.)",1),
        bullet("Voltage System - 440V, 6.6kV, 11kV, or 440V/6.6kV",1),
        numbered("Click Add Vessel. The new vessel appears on the dashboard with empty data."),
        spacer(80),
        note("The IMO number is the unique workspace key. It cannot be changed after creation. Ensure it is the correct 7-digit IMO number.","warn"),
        spacer(100),
        h("3.6  Removing a Vessel",2),
        para("Click the trash icon on the vessel card. This permanently deletes the vessel and all its data. There is no undo."),
        note("Removing a vessel deletes all switchboards, generators, cables, faults, maintenance items, and trend data for that vessel. Export your data first if needed.","danger"),
        spacer(200),pb,

        // 4. VESSEL WORKSPACE OVERVIEW
        banner("4.  Vessel Workspace - Overview Page"),spacer(120),
        h("4.1  Entering a Workspace",2),
        para("Click Open Workspace on a vessel card, or navigate directly to /vessel/{IMO} e.g. /vessel/9876543. Each workspace is fully isolated - data never overlaps between vessels."),
        h("4.2  Overview KPI Cards",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2400,6626],rows:[
          tRow([{text:"KPI",w:2400},{text:"Meaning",w:6626}],true),
          tRow([{text:"Active Load",w:2400},{text:"Sum of (kW x qty) for all running loads across all switchboards",w:6626}]),
          tRow([{text:"Gen Capacity",w:2400},{text:"Sum of rated kVA for all generators currently set to Running",w:6626}]),
          tRow([{text:"Load Factor",w:2400},{text:"Active kW / (Gen kVA x 0.8) x 100. Green <70%, amber 70-85%, red >85%",w:6626}]),
          tRow([{text:"Open Faults",w:2400},{text:"Count of fault logs not yet acknowledged",w:6626}]),
          tRow([{text:"Due This Month",w:2400},{text:"Maintenance items with next due date within the next 30 days",w:6626}]),
          tRow([{text:"Cable Issues",w:2400},{text:"Count of cables with faultCondition other than Normal",w:6626}]),
        ]}),spacer(120),
        h("4.3  Generator Load Bar",2),
        para("The large progress bar shows generator load % of rated capacity at PF 0.8. Below 70% is green (safe), 70-85% is amber (monitor), above 85% is red (reduce load - risk of blackout if a generator trips)."),
        h("4.4  Status Alert Banners",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2500,3000,3526],rows:[
          tRow([{text:"Alert",w:2500},{text:"Colour",w:3000},{text:"Condition",w:3526}],true),
          tRow([{text:"Critical Fault",w:2500},{text:"Dark Red",w:3000},{text:"Unacknowledged Critical severity fault - requires immediate action",w:3526}]),
          tRow([{text:"Overdue Maintenance",w:2500},{text:"Amber",w:3000},{text:"One or more maintenance tasks are past their due date",w:3526}]),
        ]}),spacer(120),
        h("4.5  Quick Navigation Tiles",2),
        para("Six tiles navigate to all modules. Each shows a live count (e.g. '2 switchboards', '3 open faults'). Fault and Maintenance tiles turn red/amber when action is needed."),
        spacer(200),pb,

        // 5. LOAD SCHEDULE
        banner("5.  Module Guides - Load Schedule Analysis"),spacer(120),
        h("5.1  Purpose",2),
        para("Manages all electrical loads per switchboard. Calculates running kW, kVA, and power factor in real-time as you toggle loads on and off. Used for load analysis during port, sea passage, manoeuvring, and emergency conditions."),
        h("5.2  Load Table Columns",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2000,7026],rows:[
          tRow([{text:"Column",w:2000},{text:"Meaning",w:7026}],true),
          tRow([{text:"On (checkbox)",w:2000},{text:"Toggle running state. Checked = contributing to totals. Unchecked = row dimmed, excluded from calculations.",w:7026}]),
          tRow([{text:"Load Name",w:2000},{text:"Equipment name - editable inline. Click, type, blur (Tab or click away) to save.",w:7026}]),
          tRow([{text:"Category",w:2000},{text:"Propulsion, Deck, Cargo, Safety, Navigation, Accommodation, Other",w:7026}]),
          tRow([{text:"kW",w:2000},{text:"Rated power of a single unit in kilowatts. Editable inline.",w:7026}]),
          tRow([{text:"PF",w:2000},{text:"Power factor (0.01 to 1.00). Editable inline.",w:7026}]),
          tRow([{text:"Qty",w:2000},{text:"Number of identical units. Total kW = kW x Qty.",w:7026}]),
          tRow([{text:"Total kW",w:2000},{text:"kW x Qty. Blue when running, grey when off.",w:7026}]),
          tRow([{text:"Total kVA",w:2000},{text:"Total kW / PF. Read-only calculated value.",w:7026}]),
        ]}),spacer(100),
        note("Editable fields use a raw-input pattern - the cell accepts any text while you type and validates on blur. This prevents values from being clamped mid-entry.","info"),
        h("5.3  How to Edit Loads",2),
        numbered("Click the chevron to expand the switchboard"),
        numbered("Click on any editable cell (Name, kW, PF, Qty)"),
        numbered("Type the new value"),
        numbered("Click away or press Tab - value saves and totals update immediately"),
        numbered("Toggle the On checkbox to change running state"),
        h("5.4  Adding Loads and Switchboards",2),
        bullet("Add Load - Click + Add Load at bottom of load table. New row: Name='New Load', 10 kW, PF 0.85, Qty 1, Off."),
        bullet("Add Switchboard - Click + Add Switchboard, type name, press Enter. New switchboard at vessel voltage."),
        h("5.5  Calculations",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3200,5826],rows:[
          tRow([{text:"Calculation",w:3200},{text:"Formula",w:5826}],true),
          tRow([{text:"Total kW (switchboard)",w:3200},{text:"Sum of (kW x qty) for all running loads",w:5826}]),
          tRow([{text:"kVAR per load",w:3200},{text:"kW x sqrt(1 - PF^2) / PF",w:5826}]),
          tRow([{text:"kVA (switchboard)",w:3200},{text:"sqrt(total_kW^2 + total_kVAR^2) - vector sum, not arithmetic",w:5826}]),
          tRow([{text:"Average PF",w:3200},{text:"total_kW / switchboard_kVA",w:5826}]),
        ]}),spacer(200),pb,

        // 6. GENERATORS
        banner("6.  Module Guides - Generator Management"),spacer(120),
        h("6.1  Purpose",2),
        para("Manages all diesel generators. Tracks online/offline status, run hours, service history, and calculates bus load factor in real-time."),
        h("6.2  Bus Load Factor Bar",2),
        para("Summary bar shows: Bus Load Factor %, Active Demand (kW), Available at PF 0.8 (kW), Headroom (spare kW), and Total Installed kVA."),
        h("6.3  Bringing Online / Taking Offline",2),
        numbered("Find the generator card"),
        numbered("Click Bring Online - adds it to the bus (load factor recalculates immediately)"),
        numbered("Click Take Offline - removes it from the bus"),
        spacer(80),
        note("Changing generator status immediately updates the Load Factor on the Overview page. Use this to simulate parallel operations and load-shedding scenarios.","info"),
        h("6.4  Editing Generator Specs",2),
        numbered("Click Edit on the generator card"),
        numbered("Edit any of: Name, Engine Make, Rated kVA, Voltage (V), Power Factor, Run Hours, Prime Mover, Last Service Date"),
        numbered("Click Save to confirm or Cancel to discard"),
        h("6.5  Adding and Deleting",2),
        bullet("Add - Click + Add Generator. New generator created with defaults (1000 kVA, 440V, PF 0.80, Standby, Diesel). Click Edit to enter correct specs."),
        bullet("Delete - Click the red Delete button on the generator card and confirm in the dialog."),
        spacer(200),pb,

        // 7. CABLES
        banner("7.  Module Guides - Cable Database"),spacer(120),
        h("7.1  Purpose",2),
        para("Stores the complete electrical cable register. Automatically calculates voltage drop, utilisation %, and flags cables exceeding safe limits. Mirrors the vessel's official cable schedule from as-built drawings."),
        h("7.2  Cable Table Columns",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2000,7026],rows:[
          tRow([{text:"Column",w:2000},{text:"Meaning",w:7026}],true),
          tRow([{text:"Tag",w:2000},{text:"Cable identification tag e.g. MSB-001. Shown in blue monospace font.",w:7026}]),
          tRow([{text:"From - To",w:2000},{text:"Source panel and destination equipment",w:7026}]),
          tRow([{text:"Route",w:2000},{text:"Physical routing path e.g. E/R Cable Tray A",w:7026}]),
          tRow([{text:"Size",w:2000},{text:"Conductor material, cross-section mm2, and cores e.g. Cu 240mm2 3C",w:7026}]),
          tRow([{text:"Length",w:2000},{text:"Route length in metres",w:7026}]),
          tRow([{text:"Load (A)",w:2000},{text:"Actual current (A) / Rated current (A)",w:7026}]),
          tRow([{text:"Utilisation",w:2000},{text:"Actual / Rated x 100%. Green <80%, amber 80-100%, red >100%",w:7026}]),
          tRow([{text:"VD (V)",w:2000},{text:"Voltage drop in volts using IEC copper resistivity formula",w:7026}]),
          tRow([{text:"VD %",w:2000},{text:"Voltage drop as % of system voltage. Red >3%, amber >2%",w:7026}]),
          tRow([{text:"Condition",w:2000},{text:"Normal (green), Insulation Low (amber), Earth Fault / Open Circuit (red)",w:7026}]),
          tRow([{text:"Notes",w:2000},{text:"Free-text for megger readings, inspection notes, etc.",w:7026}]),
        ]}),spacer(120),
        h("7.3  Voltage Drop Calculation",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3400,5626],rows:[
          tRow([{text:"Parameter",w:3400},{text:"Value / Formula",w:5626}],true),
          tRow([{text:"Cu Resistivity (rho)",w:3400},{text:"0.0172 ohm.mm2/m (IEC 60287 standard copper value at 20 degrees C)",w:5626}]),
          tRow([{text:"Loop Resistance (R)",w:3400},{text:"R = rho x 2 x Length / CrossSection   (x2 for outward + return path)",w:5626}]),
          tRow([{text:"Voltage Drop (V)",w:3400},{text:"VD = I_actual x R",w:5626}]),
          tRow([{text:"Voltage Drop (%)",w:3400},{text:"VD% = (VD / V_system) x 100",w:5626}]),
          tRow([{text:"Safe Limit",w:3400},{text:"VD% less than or equal to 3% (IEC 60092 guidance)",w:5626}]),
        ]}),spacer(120),
        h("7.4  Adding a Cable",2),
        numbered("Click + Add Cable (top right)"),
        numbered("Fill in the form: Cable Tag, From, To, Route, Length (m), Current Rating (A), Actual Current (A), Cores, Cross Section mm2, Conductor (Cu/Al), Insulation (XLPE/PVC/EPR/LSOH/Mineral), Fault Condition, Notes"),
        numbered("Click Save - cable appears in table with calculated VD% and utilisation"),
        spacer(200),pb,

        // 8. FAULTS
        banner("8.  Module Guides - Fault Logs"),spacer(120),
        h("8.1  Purpose",2),
        para("A timestamped record of all electrical faults and alarms. Supports acknowledge/resolve workflow and automatically detects recurring fault patterns - same equipment and fault code appearing 2 or more times."),
        h("8.2  Severity Levels",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[1800,2000,5226],rows:[
          tRow([{text:"Severity",w:1800},{text:"Badge",w:2000},{text:"Typical Use",w:5226}],true),
          tRow([{text:"Critical",w:1800},{text:"Dark Red",w:2000},{text:"Immediate danger - e.g. earth fault, emergency system failure",w:5226}]),
          tRow([{text:"Major",w:1800},{text:"Red",w:2000},{text:"Significant fault requiring urgent attention - e.g. generator trip, overload",w:5226}]),
          tRow([{text:"Minor",w:1800},{text:"Amber",w:2000},{text:"Low priority, monitoring required - e.g. insulation low, battery warning",w:5226}]),
          tRow([{text:"Info",w:1800},{text:"Blue",w:2000},{text:"Informational record for traceability",w:5226}]),
        ]}),spacer(120),
        h("8.3  Recurring Pattern Detection",2),
        para("The system counts occurrences of each unique (Equipment + Fault Code) combination. When a combination appears 2 or more times, it is flagged as a recurring pattern. An amber warning banner lists all detected patterns and each affected fault card shows a Recurring badge."),
        note("Use consistent equipment names and fault codes to enable effective recurring pattern detection. If the same fault is logged with slightly different equipment names (e.g. 'Gen 1' vs 'Main Gen 1'), the system will not recognise it as recurring.","warn"),
        h("8.4  Logging a New Fault",2),
        numbered("Click + Log Fault (top right)"),
        numbered("Fill in: Equipment (affected equipment name), Fault Code (engineering reference e.g. G1-HT-001), Severity (Critical/Major/Minor), Description (free-text fault details)"),
        numbered("Click Log Fault - timestamp set automatically"),
        h("8.5  Acknowledging and Resolving",2),
        numbered("Find the open fault in the list"),
        numbered("Click the Acknowledge button on the fault card"),
        numbered("A prompt asks for resolution details (optional but recommended)"),
        numbered("Type the resolution e.g. 'Cleaned heat exchanger, temperature normalised to 72C'"),
        numbered("Click OK - fault is marked Resolved with current timestamp"),
        spacer(80),
        note("Acknowledged faults remain in the log at reduced opacity. They do not count as Open Faults. Use the Resolved filter tab to review the audit trail.","info"),
        spacer(200),pb,

        // 9. MAINTENANCE
        banner("9.  Module Guides - Maintenance Scheduler"),spacer(120),
        h("9.1  Purpose",2),
        para("Manages planned maintenance tasks for all electrical equipment. Tracks intervals, due dates, overdue status. Automatically advances the next due date when a task is marked done."),
        h("9.2  Task Status",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2000,2000,5026],rows:[
          tRow([{text:"Status",w:2000},{text:"Left Border",w:2000},{text:"Condition",w:5026}],true),
          tRow([{text:"Overdue",w:2000},{text:"Red",w:2000},{text:"nextDue date is in the past",w:5026}]),
          tRow([{text:"Due Soon",w:2000},{text:"Amber",w:2000},{text:"nextDue is within the next 30 days",w:5026}]),
          tRow([{text:"On Schedule",w:2000},{text:"Green",w:2000},{text:"nextDue is more than 30 days away",w:5026}]),
        ]}),spacer(100),
        para("Tasks are sorted by next due date (earliest first) so the most urgent items always appear at the top."),
        h("9.3  Maintenance Categories",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[1800,7226],rows:[
          tRow([{text:"Category",w:1800},{text:"Meaning",w:7226}],true),
          tRow([{text:"PMS",w:1800},{text:"Planned Maintenance System - internal engineering schedule e.g. generator 4000H service",w:7226}]),
          tRow([{text:"Class",w:1800},{text:"Classification society requirement e.g. emergency generator monthly test per SOLAS",w:7226}]),
          tRow([{text:"Survey",w:1800},{text:"Class surveyor attendance items e.g. lifeboat release at annual survey",w:7226}]),
          tRow([{text:"Manufacturer",w:1800},{text:"Original equipment manufacturer service requirements",w:7226}]),
          tRow([{text:"Flag",w:1800},{text:"Flag state administration requirements",w:7226}]),
          tRow([{text:"SOLAS",w:1800},{text:"SOLAS-mandated tests and inspections",w:7226}]),
          tRow([{text:"Other",w:1800},{text:"Tasks not fitting the above categories",w:7226}]),
        ]}),spacer(120),
        h("9.4  Adding a Maintenance Task",2),
        numbered("Click + Add Task (top right)"),
        numbered("Fill in: Equipment, Task Description, Interval in days (30=monthly, 90=quarterly, 180=6-monthly, 365=annual), Category, Last Done date, Notes"),
        numbered("Next Due auto-calculates as Last Done + Interval. Can be manually overridden."),
        numbered("Click Save"),
        spacer(80),
        note("When you enter a Last Done date, Next Due auto-fills as Last Done + Interval. You can manually override Next Due for tasks that are already near due when first entered.","info"),
        h("9.5  Marking as Done",2),
        numbered("Click the Done button on the task card"),
        numbered("The system sets Last Done = today and calculates Next Due = today + interval"),
        numbered("Task status updates immediately"),
        spacer(200),pb,

        // 10. TRENDS
        banner("10.  Module Guides - 90-Day Trend Analysis"),spacer(120),
        h("10.1  Purpose",2),
        para("Provides historical electrical performance analysis. Shows time-series charts for load, generator utilisation, power factor, and weekly fault activity. Daily data is aggregated to weekly averages."),
        h("10.2  Summary KPIs",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2400,6626],rows:[
          tRow([{text:"KPI",w:2400},{text:"Meaning",w:6626}],true),
          tRow([{text:"Avg Load",w:2400},{text:"Mean total active kW across all 90 daily data points",w:6626}]),
          tRow([{text:"Peak Load",w:2400},{text:"Maximum total active kW recorded in the 90-day window",w:6626}]),
          tRow([{text:"Min Load",w:2400},{text:"Minimum total active kW - useful for identifying low-demand periods",w:6626}]),
          tRow([{text:"Avg PF",w:2400},{text:"Mean power factor - target should be 0.85 or above",w:6626}]),
          tRow([{text:"Total Faults",w:2400},{text:"Sum of all fault events in the trend data over 90 days",w:6626}]),
        ]}),spacer(120),
        h("10.3  The Four Charts",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3000,6026],rows:[
          tRow([{text:"Chart",w:3000},{text:"What It Shows",w:6026}],true),
          tRow([{text:"Total Active Load (kW)",w:3000},{text:"Weekly average active load. Trend icon: up arrow = rising >5% week-on-week, down = falling >5%, dash = stable.",w:6026}]),
          tRow([{text:"Generator Load Factor (%)",w:3000},{text:"Weekly generator load percentage - how hard generators are being worked over time.",w:6026}]),
          tRow([{text:"Average Power Factor",w:3000},{text:"Weekly average PF. Values consistently below 0.80 may indicate power factor correction is required.",w:6026}]),
          tRow([{text:"Weekly Fault Count",w:3000},{text:"Bar chart of fault events per week. High-fault weeks may correspond to heavy weather or systemic equipment problems.",w:6026}]),
        ]}),spacer(200),pb,

        // 11. FLEET COMPARE
        banner("11.  Cross-Fleet Comparison"),spacer(120),
        h("11.1  Purpose",2),
        para("Aggregates electrical performance data across all vessels. Requires at least 2 vessels. Accessible from the Fleet link in the top navigation bar."),
        h("11.2  Summary Table",2),
        bullet("Vessel - name with colour-coded dot (unique colour per vessel)"),
        bullet("Type, Flag"),
        bullet("Active kW - current total running load"),
        bullet("Gen kVA - available capacity at PF 0.8"),
        bullet("Load % - generator load factor (colour coded: green <70%, amber 70-85%, red >85%)"),
        bullet("Open Faults - unacknowledged fault count"),
        bullet("Overdue - overdue maintenance tasks"),
        bullet("Cable Issues - cables with fault conditions other than Normal"),
        spacer(100),
        h("11.3  Comparison Charts",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3200,5826],rows:[
          tRow([{text:"Chart",w:3200},{text:"Description",w:5826}],true),
          tRow([{text:"Load vs Capacity",w:3200},{text:"Grouped bars: Load kW vs Available kW per vessel. Identifies vessels near or above capacity.",w:5826}]),
          tRow([{text:"Generator Load Factor",w:3200},{text:"Load % per vessel. Vessels above 85% risk blackout if a generator trips.",w:5826}]),
          tRow([{text:"Faults & Maintenance",w:3200},{text:"Open Faults, Overdue Tasks, Cable Issues per vessel.",w:5826}]),
          tRow([{text:"Fleet Health Radar",w:3200},{text:"Radar chart scoring each vessel on 5 dimensions. Smaller filled area = healthier vessel.",w:5826}]),
        ]}),spacer(120),
        h("11.4  Fleet Health Radar Scores (lower = better)",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2500,6526],rows:[
          tRow([{text:"Dimension",w:2500},{text:"Score Formula (0-100)",w:6526}],true),
          tRow([{text:"Load Factor",w:2500},{text:"Generator load % capped at 100",w:6526}]),
          tRow([{text:"Fault Score",w:2500},{text:"Open faults x 20 capped at 100 (5+ open faults = maximum score)",w:6526}]),
          tRow([{text:"Maintenance",w:2500},{text:"Overdue tasks x 25 capped at 100 (4+ overdue = maximum score)",w:6526}]),
          tRow([{text:"Cable Health",w:2500},{text:"(Cable faults / total cables) x 100",w:6526}]),
          tRow([{text:"Gen Redundancy",w:2500},{text:"Standby generators x 33 capped at 100 (3 standbys = maximum redundancy)",w:6526}]),
        ]}),spacer(200),pb,

        // 12. DATA MANAGEMENT
        banner("12.  Data Management"),spacer(120),
        h("12.1  How Data Is Stored",2),
        para("All data is stored in browser localStorage under the key: marineelect-v1"),
        para("The data is a JSON Fleet object - a dictionary keyed by IMO number. Each vessel contains: vessel details, switchboards (with loads), generators, cables, faultLogs, maintenanceItems, and trendData."),
        h("12.2  Auto-Save Behaviour",2),
        para("Every change is saved to localStorage immediately. No Save button. No risk of losing changes when navigating away."),
        h("12.3  Exporting Data",2),
        numbered("Press F12 to open browser Developer Tools"),
        numbered("Go to the Console tab"),
        numbered("Type the following command and press Enter:"),
        para([code("JSON.stringify(JSON.parse(localStorage.getItem('marineelect-v1')), null, 2)")]),
        numbered("Copy the output JSON text and save it to a .json file as your backup"),
        h("12.4  Restoring Data",2),
        numbered("Open the browser console (F12)"),
        numbered("Run the command below, replacing YOUR_JSON with the backup text:"),
        para([code("localStorage.setItem('marineelect-v1', JSON.stringify(YOUR_JSON))")]),
        numbered("Refresh the page - fleet data is restored"),
        h("12.5  Clearing All Data",2),
        numbered("Open browser console"),
        numbered("Run: localStorage.removeItem('marineelect-v1')"),
        numbered("Refresh the page - demo data will reload"),
        note("Clearing localStorage is permanent and cannot be undone. Always export your data before clearing.","danger"),
        spacer(200),pb,

        // 13. TESTING
        banner("13.  How to Test the Application"),spacer(120),
        h("13.1  Feature Test Checklist",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[600,4400,4026],rows:[
          tRow([{text:"  ",w:600},{text:"Test Action",w:4400},{text:"Expected Result",w:4026}],true),
          tRow([{text:"[ ]",w:600},{text:"Open Fleet Dashboard",w:4400},{text:"2 demo vessels with KPI cards, load bars, status badges",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Check Fleet KPI cards",w:4400},{text:"Open Faults and Overdue Tasks show non-zero values",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Check alert banner",w:4400},{text:"Red alert banner visible (both demo vessels have open faults)",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Open MV Pacific Star",w:4400},{text:"Overview page loads with 6 KPIs, load bar, and quick nav tiles",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to Load Schedule",w:4400},{text:"Main Switchboard and Emergency Switchboard listed",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Toggle a load on/off",w:4400},{text:"Running kW and kVA totals update immediately",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Edit a kW value",w:4400},{text:"Type new value, blur - Total kW column updates",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Add a new load",w:4400},{text:"New row at bottom with default values",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to Generators",w:4400},{text:"3 generator cards. Gen 1 and Gen 2 show Running status.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Take Main Gen 1 offline",w:4400},{text:"Bus Load Factor increases. Bar may turn amber or red.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Edit generator specs",w:4400},{text:"Form opens, save changes - specs update on the card",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to Cable Database",w:4400},{text:"6 cables listed. MSB-010 shows amber Insulation Low badge.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Add a cable",w:4400},{text:"Fill form, save - cable appears with calculated VD% and utilisation",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to Fault Logs",w:4400},{text:"5 faults. Main Gen 1 shows Recurring badge.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Acknowledge a fault",w:4400},{text:"Enter resolution - fault moves to Resolved tab",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Log a new fault",w:4400},{text:"Fill form - new fault appears with current timestamp",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to Maintenance",w:4400},{text:"8 tasks. Fire Detection and IR Survey show Overdue badges.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Mark a task as Done",w:4400},{text:"Last Done = today, Next Due auto-advances, status changes",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Go to 90-Day Trends",w:4400},{text:"4 charts render with weekly data. KPI summary cards show averages.",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Open Cross-Fleet Compare",w:4400},{text:"Summary table and 4 charts render for both vessels",w:4026}]),
          tRow([{text:"[ ]",w:600},{text:"Refresh the browser",w:4400},{text:"All data persists - nothing lost after a full page refresh",w:4026}]),
        ]}),spacer(200),pb,

        // 14. REAL DATA ENTRY
        banner("14.  Entering Real Vessel Data"),spacer(120),
        h("14.1  Recommended Data Entry Sequence",2),
        numbered("Add the vessel on the Fleet Dashboard with correct IMO, name, type, flag, and voltage system"),
        numbered("Go to Generators - add all generators with rated kVA, voltage, PF, engine make, prime mover type, and accumulated run hours"),
        numbered("Go to Load Schedule - create switchboards matching the vessel's electrical system (Main Switchboard, Emergency Switchboard, Section Boards, Distribution Boards)"),
        numbered("Add load items from the vessel's official Electrical Load Analysis (ELA) or load schedule drawing"),
        numbered("Go to Cable Database - enter cables from the vessel's cable register starting with main feeders and critical equipment cables"),
        numbered("Go to Fault Logs - enter any currently open faults using exact fault codes from the vessel's alarm management system"),
        numbered("Go to Maintenance - enter all upcoming PMS, Class, and Survey items with correct intervals and last-done dates"),
        h("14.2  Fault Code Conventions",2),
        para("Use a consistent coding system to enable effective recurring pattern detection. Recommended format:"),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2500,2500,4026],rows:[
          tRow([{text:"Format",w:2500},{text:"Example",w:2500},{text:"Meaning",w:4026}],true),
          tRow([{text:"EQ-TYPE-NNN",w:2500},{text:"G1-HT-001",w:2500},{text:"Generator 1, High Temperature, fault 001",w:4026}]),
          tRow([{text:"SYS-FT-NNN",w:2500},{text:"HVAC-LP-003",w:2500},{text:"HVAC system, Low Pressure, fault 003",w:4026}]),
          tRow([{text:"CBL-FT-NNN",w:2500},{text:"INS-LR-010",w:2500},{text:"Insulation, Low Resistance, cable 010",w:4026}]),
        ]}),spacer(200),pb,

        // 15. TECHNICAL REFERENCE
        banner("15.  Technical Reference"),spacer(120),
        h("15.1  URL Structure",2),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[3500,5526],rows:[
          tRow([{text:"URL",w:3500},{text:"Page",w:5526}],true),
          tRow([{text:"/",w:3500},{text:"Fleet Dashboard",w:5526}]),
          tRow([{text:"/fleet",w:3500},{text:"Cross-Fleet Comparison",w:5526}]),
          tRow([{text:"/vessel/{IMO}",w:3500},{text:"Vessel Overview e.g. /vessel/9876543",w:5526}]),
          tRow([{text:"/vessel/{IMO}/loads",w:3500},{text:"Load Schedule Analysis",w:5526}]),
          tRow([{text:"/vessel/{IMO}/generators",w:3500},{text:"Generator & Bus Bar Management",w:5526}]),
          tRow([{text:"/vessel/{IMO}/cables",w:3500},{text:"Cable Database",w:5526}]),
          tRow([{text:"/vessel/{IMO}/faults",w:3500},{text:"Fault Logs",w:5526}]),
          tRow([{text:"/vessel/{IMO}/maintenance",w:3500},{text:"Maintenance Scheduler",w:5526}]),
          tRow([{text:"/vessel/{IMO}/trends",w:3500},{text:"90-Day Trend Analysis",w:5526}]),
        ]}),spacer(120),
        h("15.2  Vessel Types",2),
        para("General Cargo, Container, Bulk Carrier, Tanker, Chemical Tanker, LNG Carrier, RORO, Passenger, OPV, Offshore Vessel, Tug, Ferry"),
        h("15.3  Standard Cable Cross-Sections (mm2)",2),
        para("1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400  (IEC 60228 standard sizes)"),
        h("15.4  Load Categories",2),
        para("Propulsion, Deck, Cargo, Safety, Navigation, Accommodation, Manufacturer, Other"),
        h("15.5  Maintenance Categories",2),
        para("PMS, Class, Survey, Manufacturer, Flag, SOLAS, Other"),
        spacer(200),pb,

        // 16. GLOSSARY
        banner("16.  Glossary"),spacer(120),
        new Table({width:{size:CONT_W,type:WidthType.DXA},columnWidths:[2400,6626],rows:[
          tRow([{text:"Term",w:2400},{text:"Definition",w:6626}],true),
          tRow([{text:"IMO Number",w:2400},{text:"International Maritime Organization ship ID. 7-digit number unique to each vessel, assigned permanently. Used as the workspace key in MarineElect.",w:6626}]),
          tRow([{text:"kW",w:2400},{text:"Kilowatt - unit of active (real) power",w:6626}]),
          tRow([{text:"kVA",w:2400},{text:"Kilovolt-Ampere - unit of apparent power (= kW / PF)",w:6626}]),
          tRow([{text:"kVAR",w:2400},{text:"Kilovolt-Ampere Reactive - unit of reactive power",w:6626}]),
          tRow([{text:"Power Factor (PF)",w:2400},{text:"Ratio of active to apparent power (kW / kVA). Range 0 to 1.0. Typical shipboard value 0.80 to 0.90.",w:6626}]),
          tRow([{text:"Generator Load Factor",w:2400},{text:"Active demand as a percentage of available generator capacity at rated PF 0.8. Above 85% is the danger zone.",w:6626}]),
          tRow([{text:"Bus Bar",w:2400},{text:"The main electrical bus connecting generators to the main switchboard and distributing power to all loads.",w:6626}]),
          tRow([{text:"Voltage Drop (VD)",w:2400},{text:"Reduction in voltage along a cable due to conductor resistance. IEC guidance: 3% or less.",w:6626}]),
          tRow([{text:"Cu Resistivity",w:2400},{text:"0.0172 ohm.mm2/m - standard value for annealed copper at 20 degrees C per IEC 60287",w:6626}]),
          tRow([{text:"XLPE",w:2400},{text:"Cross-Linked Polyethylene - cable insulation material widely used in marine applications",w:6626}]),
          tRow([{text:"PMS",w:2400},{text:"Planned Maintenance System - structured schedule for equipment upkeep",w:6626}]),
          tRow([{text:"SOLAS",w:2400},{text:"Safety of Life at Sea - IMO convention defining minimum safety requirements for ships",w:6626}]),
          tRow([{text:"ELA",w:2400},{text:"Electrical Load Analysis - formal document listing all electrical loads and consumption",w:6626}]),
          tRow([{text:"localStorage",w:2400},{text:"Browser API that stores key-value pairs persistently on the user's device. No server required.",w:6626}]),
          tRow([{text:"Recurring Pattern",w:2400},{text:"In MarineElect: same equipment name + fault code appearing 2 or more times in fault log history",w:6626}]),
          tRow([{text:"Fleet",w:2400},{text:"In MarineElect: the collection of all vessels managed in a single browser session",w:6626}]),
        ]}),spacer(200),pb,

        // END
        spacer(600),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:80},children:[new TextRun({text:"MarineElect - Ship Electrical Intelligence Platform",size:28,bold:true,color:BRAND,font:"Arial"})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:80},children:[new TextRun({text:"https://marineelect.sujikumar.com",size:22,color:ACCENT,font:"Arial"})]}),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:0},children:[new TextRun({text:"Built by Sujikumar  |  sujikumar.com",size:20,italics:true,color:DGRAY,font:"Arial"})]}),
      ]
    }
  ]
})

Packer.toBuffer(doc).then(function(buf){
  fs.writeFileSync('/sessions/quirky-sweet-darwin/mnt/Sujikumar/marineelect/MarineElect_User_Guide.docx', buf)
  console.log("DONE")
}).catch(function(e){console.error(e);process.exit(1)})
