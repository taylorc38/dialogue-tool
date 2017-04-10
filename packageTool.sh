version=`cat VERSION.txt`
packageName=PGG_Dialogue_Tool_${version}
stagingDir=./staging
sourceDir=./src

echo "Creating "${packageName}

cp README.txt ${sourceDir}
zip -r ${stagingDir}/${packageName}.zip ${sourceDir}
rm ${sourceDir}/README.txt
