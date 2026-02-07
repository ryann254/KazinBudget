<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

IMPORTANT: YOU ARE THE ORCHESTRATOR, USE SUBAGENTS TO DO ALL THE RESEARCH, KILL THEM, THEN USE NEW ONES TO NOW IMPLEMENT THE CHANGES. THIS IS SO AS TO SAVE ON CONTEXT. ONLY DO THE ORCHESTRATOR/SCHEDULER ROLES.

Always open `@AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

I want you to break down the following web app idea into actionable features and for each feature I want you to first create a folder in the `openspec` folder. The newly created folder should have a conventional name describing the feature e.g. `add-form-details` - keep the names short. Now, this `add-form-details` folder will contain a design.md where you will research(web search) and describe on high level how to implement this feature, tools/technologies to use, files to create/edit/delete, tests to write, risks and trade offs. The other file in the folder will be tasks.md, this file will contain specific numbered tasks on how to implement the feature in design.md. Make the tasks simple to execute, and in a todo format. Do this for all the feature you extract from the following web app idea:

The idea is to build a web app where new or existing job seekers can use to calculate their actual take home salary. Think of someone who's looking for their new job and they don't know much about the job scene(taxes, food costs, travel costs, etc.) or someone looking to change jobs to a new city. They are our target market. The web app will ask the user for their name, company, company location, where they live, years of experience and salary offerred. The app will then use details like company location, and to search for nearby restaraunts to see how expensive food is in the area then add this to the expenses section, it will also calculate the distance from the company location and where they live to estimate travel costs the add it to the expenses section. It will check where they live and how much rent costs in the area. Then all these expenses plus taxes for their tax bracket are deducted from their salary then they get an estimate of their take home salary. We could also later on add a feature whereby we show the user whether they're getting underpaid, based on their company, location and years of experience. The app is meant to be launched in kenya, hence for now let's only focus on Nairobi, if a user types in other areas as they company location, we will just tell them the feature is coming soon to their area. I want to show the expenses section in terms of a Dashboard, where the user can edit or add new expenses like gym, utilities, groceries, etc. I also want a page dedicated to growth, where the app calculates the estimated take home salary after 3 years, 5 years, 7 years and 10 years, after inflation and current trends. The app should use some sort of scrapper or browser automation tool like browserbase to get the latest information about a specific area like rent prices in Juja, or travel costs in Nairobi.

<!-- OPENSPEC:END -->
