module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:slug*',
                destination: '/api/:slug*'
            }
        ]
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    }
}
