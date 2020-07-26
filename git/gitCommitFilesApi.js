const fetchRepopath = require("../global/fetchGitRepoPath");
const { exec } = require("child_process");
const util = require("util");
const execPromisified = util.promisify(exec);

const gitCommitFileApi = async (repoId, commitHash) => {
  const repoPath = fetchRepopath.getRepoPath(repoId);
  return await execPromisified(
    `git diff-tree --no-commit-id --name-status -r ${commitHash}`,
    { cwd: repoPath, windowsHide: true }
  )
    .then(({ stdout, stderr }) => {
      if (stdout) {
        const commitedFiles = stdout.trim().split("\n");
        return commitedFiles.map((entry) => {
          if (entry) {
            const splitEntry = entry.split(/\s/gi);
            return {
              type: splitEntry[0],
              fileName: splitEntry.slice(1, splitEntry.length).join(" "),
            };
          } else {
            return {
              type: "",
              fileName: "",
            };
          }
        });
      } else {
        console.log(stderr);
        return [
          {
            type: "",
            fileName: "",
          },
        ];
      }
    })
    .catch((err) => {
      console.log(err);
      return [
        {
          type: "",
          fileName: "",
        },
      ];
    });
};

module.exports.gitCommitFileApi = gitCommitFileApi;
