#!/usr/bin/env bash

cd ../

npm run build

cd dist/

aws s3 sync . s3://app.myclinicview.com
