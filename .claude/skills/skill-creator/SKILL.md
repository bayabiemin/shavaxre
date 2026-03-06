---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
license: Complete terms in LICENSE.txt
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge.

### What Skills Provide

1. **Specialized workflows** — Multi-step procedures for specific domains
2. **Tool integrations** — Instructions for working with specific file formats or APIs
3. **Domain expertise** — Company-specific knowledge, schemas, business logic
4. **Bundled resources** — Scripts, references, and assets for complex and repetitive tasks

### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/     - Executable code (Python/Bash/etc.)
    ├── references/  - Documentation loaded into context as needed
    └── assets/      - Files used in output (templates, icons, fonts, etc.)
```

#### Bundled Resources

**Scripts** (`scripts/`): Executable code for tasks requiring deterministic reliability or repeatedly rewritten. Token efficient, may be executed without loading into context.

**References** (`references/`): Documentation loaded as needed. Keeps SKILL.md lean. For large files (>10k words), include grep search patterns in SKILL.md.

**Assets** (`assets/`): Files not loaded into context but used in output (templates, images, fonts, boilerplate).

### Progressive Disclosure Design Principle

Three-level loading system:
1. **Metadata** (name + description) — Always in context (~100 words)
2. **SKILL.md body** — When skill triggers (<5k words)
3. **Bundled resources** — As needed (unlimited*)

## Skill Creation Process

### Step 1: Understanding the Skill with Concrete Examples

To create an effective skill, clearly understand concrete examples of how the skill will be used. Ask:
- What functionality should the skill support?
- Can you give some examples of usage?
- What would a user say that should trigger this skill?

Avoid asking too many questions at once. Conclude when there is a clear sense of functionality.

### Step 2: Planning the Reusable Skill Contents

Analyze each example by:
1. Considering how to execute from scratch
2. Identifying what scripts, references, and assets would help when executing repeatedly

### Step 3: Initializing the Skill

When creating from scratch, run `scripts/init_skill.py`:

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

The script creates skill directory with SKILL.md template, example resource directories, and example files.

### Step 4: Edit the Skill

Remember: the skill is being created for another instance of Claude to use. Focus on non-obvious procedural knowledge.

**Start with reusable resources** — implement `scripts/`, `references/`, and `assets/` files first. Delete example files not needed.

**Update SKILL.md** using imperative/infinitive form (verb-first instructions). Answer:
1. What is the purpose of the skill?
2. When should it be used?
3. How should Claude use it? Reference all reusable contents.

### Step 5: Packaging a Skill

Package into distributable zip:

```bash
scripts/package_skill.py <path/to/skill-folder>
```

Optional output directory:
```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

The script validates (frontmatter, naming, structure, description) then packages if validation passes.

### Step 6: Iterate

1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify updates needed
4. Implement changes and test again
