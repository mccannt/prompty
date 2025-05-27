import axios from 'axios';

const CODE_PROMPTS = [
  {
    title: "Write Unit Tests",
    body: "Write comprehensive unit tests for the following function/class:\n\n[Insert code here]\n\nRequirements:\n- Test framework: [Jest/Mocha/PyTest/JUnit/etc.]\n- Cover edge cases and error conditions\n- Include positive and negative test cases\n- Mock external dependencies if needed\n- Aim for >90% code coverage\n\nFor each test, include:\n- Descriptive test names\n- Arrange-Act-Assert pattern\n- Clear assertions with meaningful error messages\n- Setup and teardown if needed",
    tags: "Technical,Testing,Unit Tests,Engineering",
    locked: 1
  },
  {
    title: "Generate README Documentation",
    body: "Create a comprehensive README.md for this project:\n\n[Project name and description]\n\nInclude:\n- Project overview and purpose\n- Installation instructions\n- Usage examples with code snippets\n- API documentation (if applicable)\n- Configuration options\n- Contributing guidelines\n- License information\n- Troubleshooting section\n- Dependencies and requirements\n- Development setup instructions\n\nMake it beginner-friendly with clear examples and proper markdown formatting.",
    tags: "Technical,Documentation,README,Engineering",
    locked: 1
  },
  {
    title: "Debug Error Analysis",
    body: "Help me debug this error:\n\n```\n[Insert error message/stack trace]\n```\n\nCode context:\n[Insert relevant code]\n\nProvide:\n- Likely root cause analysis\n- Step-by-step debugging approach\n- Specific lines to check\n- Common causes of this error type\n- Recommended fixes with code examples\n- Prevention strategies\n- Related debugging tools/techniques\n\nFormat as a structured debugging guide.",
    tags: "Technical,Debugging,Troubleshooting,Engineering",
    locked: 1
  },
  {
    title: "Code Refactoring Assistant",
    body: "Refactor the following code to improve:\n\n[Insert code here]\n\nFocus areas:\n- [ ] Readability and clarity\n- [ ] Performance optimization\n- [ ] Code duplication removal\n- [ ] Better naming conventions\n- [ ] Design pattern implementation\n- [ ] Error handling improvement\n- [ ] Memory efficiency\n- [ ] Maintainability\n\nProvide:\n- Refactored code with explanations\n- Before/after comparison\n- Performance impact analysis\n- Breaking change considerations",
    tags: "Technical,Refactoring,Code Quality,Engineering",
    locked: 1
  },
  {
    title: "Git Commit Message Generator",
    body: "Generate a proper Git commit message for these changes:\n\n[Describe what was changed]\n\nFiles modified:\n[List files]\n\nType of change:\n- [ ] Bug fix\n- [ ] New feature\n- [ ] Breaking change\n- [ ] Documentation\n- [ ] Refactoring\n- [ ] Performance improvement\n- [ ] Test addition\n\nFollow conventional commit format:\n- Use present tense\n- Keep subject line under 50 characters\n- Include body with detailed explanation if needed\n- Reference issue numbers if applicable",
    tags: "Technical,Git,Version Control,Engineering",
    locked: 1
  },
  {
    title: "Error Handling Implementation",
    body: "Add comprehensive error handling to this code:\n\n[Insert code here]\n\nImplement:\n- Try-catch blocks where appropriate\n- Custom error classes/types\n- Meaningful error messages\n- Proper error propagation\n- Logging for debugging\n- User-friendly error responses\n- Recovery mechanisms where possible\n- Input validation\n\nLanguage/Framework: [specify]\n\nProvide both the enhanced code and explanation of error handling strategy.",
    tags: "Technical,Error Handling,Engineering,Reliability",
    locked: 1
  },
  {
    title: "Integration Test Builder",
    body: "Create integration tests for this API/component:\n\n[Insert API endpoints or component description]\n\nTest scenarios:\n- Happy path workflows\n- Error conditions and edge cases\n- Authentication/authorization\n- Data validation\n- Database interactions\n- External service integrations\n- Performance under load\n\nInclude:\n- Test setup and teardown\n- Mock data/fixtures\n- Assertion strategies\n- Test isolation\n- CI/CD integration considerations\n\nFramework: [specify testing framework]",
    tags: "Technical,Testing,Integration Tests,Engineering",
    locked: 1
  },
  {
    title: "Code Comments & Documentation",
    body: "Add comprehensive inline documentation to this code:\n\n[Insert code here]\n\nAdd:\n- Function/method docstrings with parameters and return values\n- Inline comments for complex logic\n- Type annotations (if applicable)\n- Usage examples\n- Performance notes\n- Edge case handling explanations\n- TODO items for future improvements\n\nFollow language-specific documentation standards:\n- JSDoc for JavaScript\n- Docstrings for Python\n- Javadoc for Java\n- XML comments for C#\n- etc.",
    tags: "Technical,Documentation,Code Comments,Engineering",
    locked: 1
  },
  {
    title: "Database Migration Script",
    body: "Create a database migration script for:\n\n[Describe the schema changes needed]\n\nDatabase: [PostgreSQL/MySQL/MongoDB/etc.]\n\nInclude:\n- UP migration (apply changes)\n- DOWN migration (rollback changes)\n- Data preservation strategies\n- Index creation/modification\n- Constraint handling\n- Performance considerations for large tables\n- Backup recommendations\n- Testing instructions\n\nEnsure zero-downtime deployment compatibility where possible.",
    tags: "Technical,Database,Migration,Engineering",
    locked: 1
  },
  {
    title: "Configuration Setup Guide",
    body: "Create configuration setup for:\n\n[Application/service name]\n\nEnvironments: [development/staging/production]\n\nInclude:\n- Environment variable definitions\n- Configuration file templates\n- Default values and validation\n- Security considerations (secrets management)\n- Docker/containerization config\n- CI/CD environment setup\n- Local development setup\n- Configuration validation scripts\n- Documentation for each setting\n\nProvide examples for each environment type.",
    tags: "Technical,Configuration,Setup,Engineering,DevOps",
    locked: 1
  },
  {
    title: "Code Performance Profiler",
    body: "Analyze and optimize the performance of this code:\n\n[Insert code here]\n\nAnalyze:\n- Time complexity (Big O)\n- Memory usage patterns\n- Bottlenecks and hot spots\n- Database query efficiency\n- Network call optimization\n- Caching opportunities\n- Algorithmic improvements\n- Data structure optimization\n\nProvide:\n- Performance metrics before/after\n- Specific optimization recommendations\n- Benchmarking approach\n- Monitoring suggestions\n- Trade-off analysis",
    tags: "Technical,Performance,Optimization,Engineering",
    locked: 1
  },
  {
    title: "Logging & Monitoring Setup",
    body: "Implement comprehensive logging and monitoring for:\n\n[Application/service description]\n\nImplement:\n- Structured logging with appropriate levels\n- Request/response logging\n- Error tracking and alerting\n- Performance metrics collection\n- Business metrics tracking\n- Security event logging\n- Log rotation and retention\n- Monitoring dashboards\n- Alert thresholds and escalation\n\nFramework: [specify logging framework]\nMonitoring tools: [Prometheus/DataDog/New Relic/etc.]\n\nInclude code examples and configuration.",
    tags: "Technical,Logging,Monitoring,Engineering,DevOps",
    locked: 1
  }
];

async function addCodePrompts() {
  console.log('Adding 12 practical code-related prompts...');
  
  for (let i = 0; i < CODE_PROMPTS.length; i++) {
    const prompt = CODE_PROMPTS[i];
    try {
      const response = await axios.post('http://localhost:5001/api/prompts', prompt);
      console.log(`✅ Added: "${prompt.title}" (ID: ${response.data.id})`);
    } catch (error) {
      console.error(`❌ Failed to add "${prompt.title}":`, error.message);
    }
  }
  
  console.log('\n🎉 Finished adding code-related prompts!');
}

addCodePrompts().catch(console.error); 