module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:slug*',
                destination: 'https://mask.fantom.digital/api/:slug*'
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
