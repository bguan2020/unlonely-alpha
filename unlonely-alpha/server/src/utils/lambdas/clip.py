import json
import boto3
s3 = boto3.resource('s3')

print("working?1")

## Pull your specific MediaConvert endpoint https://docs.aws.amazon.com/mediaconvert/latest/apireference/aws-cli.html

mediaconvert_client = boto3.client('mediaconvert', endpoint_url='https://hvtjrir1c.mediaconvert.us-west-2.amazonaws.com')
ivs_client = boto3.client('ivs')

def getIVSManifest(arn):
    response = ivs_client.get_stream_key(arn=arn)
    stream_key = response['streamKey']
    # Get the recording configuration
    response = ivs_client.get_recording_configuration(arn=arn)
    s3_bucket = response['s3_bucket']
    s3_path = response['s3_path']
    # construct the main manifest path
    main_manifest = f"s3://{s3_bucket}/{s3_path}/{stream_key}/playlist.m3u8"
    print(main_manifest)
    return main_manifest
    
def createMediaConvertJob(manifest):
    ##Note change the following variables to your own, 
    role_arn = "arn:aws:iam::500434899882:role/service-role/basicPermissions"
    ##preroll_path = "s3://DOC-EXAMPLE-BUCKET/preroll.mp4"
    postroll_path = "s3://unlonely-clips/postroll/postroll.mp4"
    ##previously_recorded_image = "s3://DOC-EXAMPLE-BUCKET/previously_recorded_image.png"
    job_template = "unlonely-stream-clips-job-template"

    
    #### No edits needed past this point 
    
    settings_json = """{
   "Inputs": [
      {
 
        "TimecodeSource": "ZEROBASED",
        "VideoSelector": {
          "ColorSpace": "FOLLOW",
          "Rotate": "DEGREE_0",
          "AlphaBehavior": "DISCARD"
        },
        "AudioSelectors": {
          "Audio Selector 1": {
            "Offset": 0,
            "DefaultSelection": "DEFAULT",
            "ProgramSelection": 1
          }
        }
      },
      {
        "TimecodeSource": "ZEROBASED",
        "VideoSelector": {
          "ColorSpace": "FOLLOW",
          "Rotate": "DEGREE_0",
          "AlphaBehavior": "DISCARD"
        },
        "AudioSelectors": {
          "Audio Selector 1": {
            "Offset": 0,
            "DefaultSelection": "DEFAULT",
            "ProgramSelection": 1
          }
        },
        "FileInput": "s3://%s"
      },
      {
        "TimecodeSource": "ZEROBASED",
        "VideoSelector": {
          "ColorSpace": "FOLLOW",
          "Rotate": "DEGREE_0",
          "AlphaBehavior": "DISCARD"
        },
        "AudioSelectors": {
          "Audio Selector 1": {
            "Offset": 0,
            "DefaultSelection": "DEFAULT",
            "ProgramSelection": 1
          }
        },
        "FileInput": "%s"
      }
    ]}""" % (manifest,postroll_path)
    
    response = mediaconvert_client.create_job(JobTemplate=job_template,Role=role_arn,Settings=json.loads(settings_json))
    print(response)

def lambda_handler(event, context):
  print("working?")
    print(json.dumps(event))
    arn = event["detail"]["channel-arn"]

    #Get path to recording_ended.json and then create a MediaConvert job 
    createMediaConvertJob(getIVSManifest(arn))

    return {
        'statusCode': 200,
        'body': ("Job created")
    }