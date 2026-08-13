// Academic Credit citation generators: BibTeX / CITATION.cff / APA

const latestVersion = (tool) =>
  (tool.evolutionHistory && tool.evolutionHistory[0] && tool.evolutionHistory[0].version) || 'v1.0.0';

const latestDate = (tool) =>
  (tool.evolutionHistory && tool.evolutionHistory[0] && tool.evolutionHistory[0].date) || '2026-01-01';

const releaseYear = (tool) => latestDate(tool).slice(0, 4);

export const generateBibTeX = (tool, author) => {
  const key = `${(author ? author.name : tool.author).split(/\s|\//)[0].toLowerCase()}_${releaseYear(tool)}_${tool.id.split('-')[0]}`;
  return `@software{${key},
  author       = {${author ? author.name : tool.author}},
  title        = {${tool.title}},
  year         = {${releaseYear(tool)}},
  version      = {${latestVersion(tool)}},
  publisher    = {SciForge Hub},
  doi          = {${tool.credit ? tool.credit.doi : 'N/A'}},
  url          = {https://doi.org/${tool.credit ? tool.credit.doi : ''}},
  license      = {${tool.license || 'N/A'}},
  note         = {SciForge-verified ${tool.type}: SkillsBench ${tool.skillbench ? tool.skillbench.toFixed(1) : 'N/A'}}
}`;
};

export const generateCFF = (tool, author) => {
  return `cff-version: 1.2.0
message: "If you use this ${tool.type} in your research, please cite it as below."
title: "${tool.title}"
authors:
  - name: "${author ? author.name : tool.author}"
    affiliation: "${author ? author.affiliation : ''}"
type: software
version: "${latestVersion(tool)}"
date-released: "${latestDate(tool)}"
doi: ${tool.credit ? tool.credit.doi : 'N/A'}
url: "https://sciforge.ai/tool/${tool.id}"
repository-code: "https://github.com/${tool.repo}"
license: ${tool.license || 'N/A'}`;
};

export const generateAPA = (tool, author) => {
  const name = author ? author.name : tool.author;
  const doi = tool.credit ? tool.credit.doi : '';
  return `${name} (${releaseYear(tool)}). ${tool.title} (${latestVersion(tool)}) [Research tool / ${tool.type}]. SciForge Hub. https://doi.org/${doi}`;
};
