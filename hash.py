from Crypto.Cipher import AES
from Crypto.Hash import MD5
from Crypto.Util import Padding
import base64
import os
import json
import sys
import xxhash
from os import path
from pathlib import Path
import glob


def getfiles(source):
    files = []
    for file in glob.glob(f'{source}/**', recursive=True):
        truefilename = file.replace('\\', '/')
        if path.isfile(truefilename):
            files.append(truefilename)
    return files


def hashes(source, version):
    files = getfiles(source)
    print(len(files))
    for filename in files:
        with open(filename, 'rb') as fileb:
            hasher = xxhash.xxh64()
            hasher.update(fileb.read())
            hex_text = hasher.hexdigest()
            DirectLink = filename.replace("public/", "")
            file = {
                "url": f"./{DirectLink}",
                "file_path": filename.replace(f"{source}/", ""),
                "algorithm": "xxhash",
                "size": Path(filename).stat().st_size,
                "hash": str(int(hex_text, 16))
            }
            if not version == None:
                file["assetversion"] = version
            print(json.dumps(file))


def unpad(s): return s[:-ord(s[len(s) - 1:])]


BLOCK_SIZE = 16


def pad(s): return s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE
                                                                - len(s) % BLOCK_SIZE)


def decrypt_sign(data, ver_global: bool = False):
    # print(type(data))
    # return
    dec_data = {}
    if None != dec_data:
        dec_data = None

    SALT_LEN = 8
    KEY_LEN = 32
    IV_LEN = 16
    ITERATIONS = 1
    HASH_ALGO = MD5

    if ver_global == True:
        password = 'iyMgxvi240Smc5oPikQugi0luUp8aQjcxMPO27n7CyPIIDZbfQbEgpWCYNHSTHB'
    else:
        password = '2nV6eyINqhT6iDmzack9fykEAQgFkDvABIHjxmMY3qBENWOlnGtzkOHXRWhrIztK'

    data = base64.b64decode(data)
    salt = data[:SALT_LEN]
    sign_key_iv = sign_key_iv_buffer = HASH_ALGO.new(
        password.encode() + salt).digest()

    while len(sign_key_iv) < KEY_LEN + IV_LEN:
        sign_key_iv_buffer = HASH_ALGO.new(
            sign_key_iv_buffer + password.encode() + salt).digest()
        sign_key_iv += sign_key_iv_buffer

    sign_key, sign_iv = sign_key_iv[:KEY_LEN], sign_key_iv[KEY_LEN:]
    cipher = AES.new(sign_key, AES.MODE_CBC, sign_iv)

    try:
        dec_data = Padding.unpad(cipher.decrypt(
            data[SALT_LEN:]), AES.block_size)
    except Exception as e:
        print(e)
    print(json.dumps(json.loads(dec_data.decode("utf-8"))))


def get_key_and_iv(password, salt, klen=32, ilen=16, msgdgst='md5'):
    mdf = getattr(__import__('hashlib', fromlist=[msgdgst]), msgdgst)
    password = password.encode('ascii', 'ignore')  # convert to ASCII

    try:
        maxlen = klen + ilen
        keyiv = mdf(password + salt).digest()
        tmp = [keyiv]

        while len(tmp) < maxlen:
            tmp.append(mdf(tmp[-1] + password + salt).digest())
            keyiv += tmp[-1]  # append the last byte

        key = keyiv[:klen]
        iv = keyiv[klen:klen + ilen]

        return (key, iv)
    except UnicodeDecodeError:
        return (None, None)


def encrypt_sign(data, ver_global: bool = False):
    data = pad(data)
    key1 = str.encode(data)
    salt = os.urandom(8)
    if ver_global:
        password = 'iyMgxvi240Smc5oPikQugi0luUp8aQjcxMPO27n7CyPIIDZbfQbEgpWCYNHSTHB'
    else:
        password = '2nV6eyINqhT6iDmzack9fykEAQgFkDvABIHjxmMY3qBENWOlnGtzkOHXRWhrIztK'
    (key, iv) = get_key_and_iv(password, salt, klen=32, ilen=16,
                               msgdgst='md5')
    cipher = AES.new(key, AES.MODE_CBC, iv)
    a = cipher.encrypt(key1)
    a = salt + a
    print(base64.b64encode(a).decode())


args = json.loads(sys.argv[1])
if args["function"] == 'hashes':
    hashes(args["source"], args["version"] if 'version' in args else 0)
elif args["function"] == "decryptsign":
    decrypt_sign(args["sign"], args["isGlobal"])
elif args["function"] == "encryptsign":
    encrypt_sign(args["sign"], True)
