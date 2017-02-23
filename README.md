# deploy-to-gh-pages
Shell script to deploy dir to gh-pages

# Usage
`$ deploy-to-gh-pages [--update] <folder>`

Options:
- `folder` - path to folder content of which should be deployed to gh-pages.
All previous contents of gh-pages branch are removed
- `--update` - if specified, content from this folder updates original contents of gh-pages
- `--local` - if specified, tool runs in non-CI mode (doesn't configure git user/email to Travis-CI + doesn't require GH_TOKEN)
