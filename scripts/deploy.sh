#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

cd ../

npm run build

cd dist/

aws s3 sync . s3://app.myclinicview.com
