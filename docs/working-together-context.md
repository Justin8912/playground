# Copilot Feature Development Pattern

## Purpose and Overview

The Copilot Feature Development Pattern is a structured workflow for software engineers to collaborate effectively with GitHub Copilot when implementing new features. This pattern leverages Copilot's strengths as a code generator while maintaining human direction, context-setting, and quality control.

### Core Concepts

1. **Single Writer Pattern**: Copilot acts as the primary writer of code, with the Software Engineer providing direction and feedback. This streamlines development by having a single entity responsible for implementation while the engineer focuses on guiding the process.

2. **Documentation-Driven Development**: The development process begins with documentation rather than code. This ensures that both the engineer and Copilot have a clear understanding of the feature's goals and requirements before any implementation begins.

3. **Milestone-Based Implementation**: Features are broken down into discrete, testable milestones. Each milestone represents a specific, verifiable piece of functionality that can be independently validated.

4. **Iterative Refinement**: The pattern embraces continuous feedback and refinement cycles between the Software Engineer and Copilot, ensuring that the implementation meets requirements and maintains high quality.

5. **Conceptual Shift**: This pattern requires a mindset change where Copilot is the implementer, and the Software Engineer provides guidance and context. This shift from traditional development practices is fundamental to success with this pattern.

## Roles and Responsibilities

### Software Engineer Role

The Software Engineer acts as the director of the development process, providing guidance and validation. Key responsibilities include:

- **Providing Context**: Writing the initial feature introduction document and providing any necessary domain knowledge
- **Direction and Feedback**: Reviewing Copilot's implementation plans and providing constructive feedback
- **Quality Assurance**: Validating milestone completion and ensuring the implemented code meets requirements
- **Project Management**: Making git commits, deciding when to proceed to the next milestone, and tracking overall progress
- **Documentation Support**: Retrieving or creating documentation to help Copilot understand the project context
- **Context Building**: Gathering and organizing relevant information that Copilot needs to understand the project

The Software Engineer is the ultimate decision-maker in the process, responsible for approving plans and implementations before proceeding.

### Copilot Role

Copilot serves as the primary implementer in this pattern, responsible for:

- **Documentation Structure**: Creating the initial documentation framework for new features
- **Planning**: Drafting implementation plans based on the Software Engineer's feature introduction
- **Implementation**: Writing code according to the approved plan
- **Verification**: Running builds and tests to verify changes
- **Documentation Maintenance**: Updating progress documentation as implementation proceeds
- **Feedback Processing**: Making changes based on the Software Engineer's feedback
- **Self-Correction**: Identifying and fixing issues during implementation without requiring intervention

Copilot manages the code under the "single writer" principle, taking direction from the Software Engineer but handling the details of implementation.

## Process Flow

The feature development process follows a structured flow with distinct phases:

### 1. Feature Initialization

- **Documentation Setup**: Copilot creates the directory structure and blank documentation files for the new feature
- **Feature Introduction**: The Software Engineer writes the intro.md file, providing context about the feature, goals, and any relevant constraints
- **Understanding Check**: Copilot confirms its understanding of the intro with the Software Engineer to ensure alignment

### 2. Planning Phase

- **Plan Creation**: Copilot drafts an implementation plan with discrete milestones
- **Plan Review**: The Software Engineer reviews the plan and provides feedback
- **Plan Refinement**: Copilot updates the plan based on feedback
- **Plan Approval**: The cycle continues until the Software Engineer is satisfied with the plan

### 3. Implementation Phase

- **Milestone Implementation**: Copilot implements each milestone sequentially
- **Verification**: Copilot runs builds and tests to verify changes
- **Review**: The Software Engineer reviews the implementation
- **Refinement**: Copilot makes updates based on feedback
- **Validation**: The cycle continues until the milestone implementation is satisfactory

### 4. Milestone Completion

- **Approval**: The Software Engineer approves the milestone
- **Documentation Update**: Copilot updates the implementation progress document
- **Knowledge Capture**: Any lessons learned are documented
- **Next Steps**: Work begins on the next milestone with direction from the Software Engineer

### 5. Feature Completion

- **Documentation Updates**: Project-level documentation is updated to reflect the new feature
- **Final Review**: The overall implementation is reviewed for completeness and quality
- **Process Review**: The team reflects on the development process and identifies any improvements for future features
- **Capture Knowledge**: Document any new patterns or approaches that should be preserved for future features

## Documentation Structure

### Base Folder Organization

The pattern uses a standardized documentation structure:

- **Base folder**: `docs/feat/` - Contains all feature-related documentation
- **Feature-specific folder**: `docs/feat/[story-id-in-rally]-[feature-id-in-rally]/` - Contains documentation for a specific feature. Feature and story information can be found in Rally.
- **Dependencies**: `docs/deps/` - Contains documentation on dependencies, integrations, and interfaces

### Required Documents

Each feature requires three primary documents:

#### 1. `intro.md`

**Purpose**: Provides feature introduction and context  
**Author**: Software Engineer  
**Content**:
- Introduction to the feature
- Goal of the feature
- Context for implementation
- Any relevant constraints or considerations

Example:
```markdown
# Introduction

We are going to be adding a new search page to the mobile app

# Goal

Users see a new "Search Now" button on the home screen. When they click the button they are taken to
a search page where they can search for vehicles by VIN

# Context

We are adding a feature to a published, production, application

UI responsiveness is a significant concern

# Implementation guidelines

Use Sonar APIs for vehicle search

Add unit tests for all new code

Add behavior tests for all new functionality

# Acceptance Criteria 

Critera that must be met for the story to be considered complete. 

```

#### 2. `implementation-plan.md`

**Purpose**: Outlines detailed implementation milestones  
**Author**: Copilot (with Software Engineer feedback)  
**Content**:
- Clear milestone definitions
- Expected outcomes for each milestone
- High-level implementation approach

Each milestone should:
- Describe a single discrete testable change
- Include a section describing the expected outcome
- Be high level without code, technical specifications, or directory structures
- Use prose only

Example milestone format:
```markdown
## Milestone 1: Create Basic Search Screen

Create a basic search screen with a search input field and a search button. The screen should handle loading and error states appropriately.

**Expected outcome:** A functional search screen that allows users to enter a VIN and initiate a search. The screen will show loading indicators and handle errors gracefully.

- Implement a new SearchScreen component
- Add navigation to the screen from the home screen
- Implement basic UI with search input and button
- Add loading state and error handling
```

#### 3. `implementation-progress.md`

**Purpose**: Tracks progress of implementation  
**Author**: Copilot (updated throughout development)  
**Content**:
- Checklists for each milestone
- Status of completion
- Completion dates
- Summary of what was achieved

Example progress format:
```markdown
## Milestone 1: Create Basic Search Screen
- [x] Implement a new SearchScreen component
- [x] Add navigation to the screen from the home screen
- [x] Implement basic UI with search input and button
- [x] Add loading state and error handling

**Status**: Complete (May 2, 2025)

**Summary**: Implemented the basic search screen with a text input for VIN entry and a search button. Added proper navigation from the home screen. Included loading indicators and error handling for network failures. The screen is accessible and meets all UI responsiveness requirements.
```

### Shared Documentation

- **`docs/feat/lessons-learned.md`**: Captures key lessons learned during implementation
- **`docs/deps/`**: Contains documentation on dependencies, integrations, and interfaces

## Working with Copilot

### Communication Guidelines

Effective communication with Copilot is crucial for success with this pattern:

1. **Context over Directives**: Provide context and rationale rather than specific implementation instructions. For example, instead of "Add a button here," explain "Users need a way to initiate the search from the home screen."

2. **Complete Information**: Provide all relevant information upfront to avoid hallucinations or incorrect assumptions.

3. **Clear Terminology**: Use consistent terminology throughout your communications to avoid confusion.

4. **Feedback Format**: Structure feedback with clear indications, such as:
   ```
   feedback:
   - I like how you've handled error states in this implementation
   - The navigation flow doesn't match what we discussed - users should return to the home screen after completing a search
   - Consider adding accessibility labels to the new UI elements
   ```

5. **Explain the "Why"**: When requesting changes, explain the reasoning behind them to help Copilot make better decisions in future implementations.

6. **Use the Word "Milestone"**: The term "milestone" is specifically chosen because Copilot responds well to it. Using this term helps Copilot understand when to naturally stop its implementation work.

7. **Start and End Signals**: Be clear when you want Copilot to start implementation ("Let's start the first milestone") and when you're providing feedback versus requesting continuation.