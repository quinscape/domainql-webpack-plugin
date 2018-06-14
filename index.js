const fs = require("fs");
const path = require("path");

const PRELOADED_QUERIES_VAR = "PRELOADED_QUERIES";
const PRELOADED_QUERIES_RE = new RegExp(PRELOADED_QUERIES_VAR + "\\s*=([\\s\\S]*)$", "m");

function removeComments(source)
{
    return (
        source
            .replace(/\/\*[\S\s]*?\*\//gm,"")
            .replace(/^(.*?)\/\/.*$/gm, "$1")
    );
}

/**
 * @module WebpackOnBuildPlugin
 */

function onBuildDone(stats)
{
    try
    {

        const buildDir = this.buildDir;
        const opts = this.opts;

        const data = stats.toJson();

        const queriesMap = {};
        data.chunks.forEach(chunk => {

            const queryModules = chunk.modules.filter(mod => mod.depth === 0 && mod.providedExports && mod.providedExports.indexOf(PRELOADED_QUERIES_VAR) >= 0);


            if (opts.debug)
            {
                console.log("Found", queryModules.length, " query exporting entry points in chunk", chunk.names[0]);
            }

            for (let i = 0; i < queryModules.length; i++)
            {
                const mod = queryModules[i];

                const source = removeComments(mod.source || mod.modules[0].source);

                const m = PRELOADED_QUERIES_RE.exec(source);
                //console.log(m);
                if (m)
                {
                    queriesMap[chunk.names[0]] = m[1];
                }
                else
                {
                    if (opts.debug)
                    {
                        console.log("NO MATCH FOR SOURCE:", source);
                    }
                }
            }
        });

        const preloadedQueriesPath = path.resolve(buildDir, "preloaded-queries.json");
        if (opts.debug)
        {
            console.log("Writing initial queries to", preloadedQueriesPath);
        }
        fs.writeFileSync(
            preloadedQueriesPath,
            JSON.stringify(queriesMap, null, 4)
        );
    }
    catch (e)
    {
        console.error(e);
    }
}

const DEFAULT_OPTS = {

    /** if true, print report on actions */
    debug: false
};

function DomainQLPlugin(opts)
{
    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
    this.onBuildDone = onBuildDone.bind(this);
}

DomainQLPlugin.prototype.apply = function (compiler) {
    this.buildDir = compiler.options.output.path;

    compiler.plugin('done', this.onBuildDone);
};

module.exports = DomainQLPlugin;
