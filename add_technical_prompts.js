import axios from 'axios';

const TECHNICAL_PROMPTS = [
  {
    title: "Code Review Checklist",
    body: "Perform a comprehensive code review for the following code. Evaluate:\n\n[Insert code here]\n\nReview criteria:\n- Code quality and readability\n- Performance considerations\n- Security vulnerabilities\n- Best practices adherence\n- Error handling\n- Test coverage\n- Documentation\n- Maintainability\n\nProvide:\n- Specific feedback with line references\n- Suggestions for improvement\n- Priority level for each issue (High/Medium/Low)",
    tags: "Technical,Engineering,Code Review,Quality Assurance",
    locked: 1
  },
  {
    title: "System Architecture Documentation",
    body: "Create comprehensive system architecture documentation for [system/application name].\n\nSystem details:\n- Purpose: [what the system does]\n- Scale: [users, requests, data volume]\n- Key requirements: [performance, security, etc.]\n- Technology stack: [languages, frameworks, databases]\n\nInclude:\n- High-level architecture diagram description\n- Component interactions and data flow\n- Database schema overview\n- API endpoints and contracts\n- Security considerations\n- Scalability and performance strategies\n- Monitoring and alerting approach",
    tags: "Technical,Engineering,Architecture,Documentation",
    locked: 1
  },
  {
    title: "API Documentation Generator",
    body: "Generate comprehensive API documentation for the following endpoint:\n\n[Insert API endpoint details]\n\nInclude:\n- Endpoint description and purpose\n- HTTP method and URL structure\n- Request parameters (path, query, body)\n- Request/response examples\n- Error codes and messages\n- Authentication requirements\n- Rate limiting information\n- SDK/code examples in multiple languages\n\nFormat: OpenAPI 3.0 specification or clear markdown format",
    tags: "Technical,Engineering,API,Documentation",
    locked: 1
  },
  {
    title: "Bug Analysis and Root Cause",
    body: "Analyze the following bug report and provide a systematic troubleshooting approach:\n\n[Insert bug description, error logs, reproduction steps]\n\nProvide:\n- Initial hypothesis about the root cause\n- Step-by-step debugging methodology\n- Relevant log analysis\n- Potential areas to investigate\n- Testing strategy to verify the fix\n- Prevention measures for similar issues\n- Risk assessment of proposed solutions\n\nFormat as a structured incident analysis report.",
    tags: "Technical,Bug,Debugging,Engineering,Troubleshooting",
    locked: 1
  },
  {
    title: "Database Schema Design",
    body: "Design an optimal database schema for [application/system description].\n\nRequirements:\n- Data entities: [list main entities]\n- Relationships: [describe key relationships]\n- Expected scale: [volume, growth projections]\n- Query patterns: [common operations]\n- Performance requirements: [response times, throughput]\n\nProvide:\n- Entity Relationship Diagram (ERD) description\n- Table structures with data types\n- Indexing strategy\n- Normalization considerations\n- Partitioning/sharding approach if needed\n- Migration strategy",
    tags: "Technical,Database,Engineering,Design,Architecture",
    locked: 1
  },
  {
    title: "Security Vulnerability Assessment",
    body: "Conduct a security assessment for the following system/code:\n\n[Insert system description or code]\n\nAnalyze for:\n- Authentication and authorization flaws\n- Input validation vulnerabilities\n- SQL injection risks\n- XSS vulnerabilities\n- CSRF protection\n- Data encryption requirements\n- Access control issues\n- API security concerns\n\nProvide:\n- Risk severity ratings (Critical/High/Medium/Low)\n- Detailed vulnerability descriptions\n- Exploitation scenarios\n- Remediation recommendations\n- Security best practices",
    tags: "Technical,Security,Engineering,Vulnerability Assessment",
    locked: 1
  },
  {
    title: "Performance Optimization Plan",
    body: "Create a performance optimization strategy for [application/system].\n\nCurrent performance metrics:\n- Response times: [current measurements]\n- Throughput: [requests/second]\n- Resource usage: [CPU, memory, disk]\n- Bottlenecks identified: [known issues]\n\nAnalyze and optimize:\n- Database query performance\n- Caching strategies\n- Code-level optimizations\n- Infrastructure scaling\n- Network optimization\n- Frontend performance\n\nProvide:\n- Prioritized optimization roadmap\n- Expected performance improvements\n- Implementation effort estimates\n- Monitoring and measurement plan",
    tags: "Technical,Performance,Engineering,Optimization",
    locked: 1
  },
  {
    title: "Technical Proposal Writer",
    body: "Write a technical proposal for [project/feature/solution].\n\nProject details:\n- Problem statement: [what needs to be solved]\n- Stakeholders: [who is involved/affected]\n- Timeline: [project duration]\n- Budget considerations: [resource constraints]\n- Success criteria: [how to measure success]\n\nStructure:\n- Executive summary\n- Technical approach and methodology\n- Architecture and design decisions\n- Implementation timeline with milestones\n- Risk assessment and mitigation\n- Resource requirements\n- Testing and quality assurance plan\n- Maintenance and support considerations",
    tags: "Technical,Engineering,Proposal,Planning,Documentation",
    locked: 1
  },
  {
    title: "Infrastructure as Code Template",
    body: "Generate Infrastructure as Code templates for deploying [application/service].\n\nInfrastructure requirements:\n- Cloud provider: [AWS/Azure/GCP]\n- Application type: [web app/API/microservice]\n- Scaling requirements: [auto-scaling parameters]\n- Security requirements: [network, access controls]\n- Database needs: [type, size, backup]\n- Monitoring requirements: [metrics, alerts]\n\nProvide:\n- Terraform/CloudFormation templates\n- Resource configuration details\n- Security group and network configurations\n- Environment variable management\n- CI/CD pipeline integration\n- Cost optimization recommendations",
    tags: "Technical,Infrastructure,DevOps,Engineering,Cloud",
    locked: 1
  },
  {
    title: "Technical Interview Questions",
    body: "Generate technical interview questions for a [role/level] position.\n\nRole details:\n- Position: [job title]\n- Experience level: [junior/mid/senior]\n- Technology stack: [specific technologies]\n- Key skills: [required competencies]\n- Interview duration: [time allocation]\n\nCreate questions for:\n- Technical knowledge assessment\n- Problem-solving scenarios\n- System design challenges\n- Code review exercises\n- Debugging scenarios\n- Best practices understanding\n\nInclude:\n- Expected answer guidelines\n- Follow-up questions\n- Difficulty progression\n- Evaluation criteria",
    tags: "Technical,Engineering,Interview,Hiring,Assessment",
    locked: 1
  }
];

async function addTechnicalPrompts() {
  console.log('Adding 10 technical and engineering prompts...');
  
  for (let i = 0; i < TECHNICAL_PROMPTS.length; i++) {
    const prompt = TECHNICAL_PROMPTS[i];
    try {
      const response = await axios.post('http://localhost:5001/api/prompts', prompt);
      console.log(`✅ Added: "${prompt.title}" (ID: ${response.data.id})`);
    } catch (error) {
      console.error(`❌ Failed to add "${prompt.title}":`, error.message);
    }
  }
  
  console.log('\n🎉 Finished adding technical prompts!');
}

addTechnicalPrompts().catch(console.error); 