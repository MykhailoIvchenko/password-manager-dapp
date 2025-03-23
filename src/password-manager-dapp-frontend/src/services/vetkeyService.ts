import { get, set } from 'idb-keyval';
//@ts-ignore
import * as vetkd from '../vetkd_user_lib/ic_vetkd_utils.js';
import { password_manager_dapp_backend } from '../../../declarations/password-manager-dapp-backend';

const hexDecode = (hexString: string) =>
  Uint8Array.from(
    (hexString.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16))
  );

// const hexEncode = (bytes: any[]) =>
//   bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

function stringTo128BitBigEndianUint8Array(str: string): Uint8Array {
  var hex = str;

  while (hex.length < 32) {
    hex = '0' + hex;
  }

  hex = hex.slice(0, 32);

  var len = hex.length / 2;
  var u8 = new Uint8Array(len);

  var i = 0;
  var j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }

  return u8;
}

async function fetchKeyIfNeeded(
  secretId: string,
  userSecretKey: string,
  principalId: string,
  actor: any
) {
  if (!(await get([secretId, principalId]))) {
    const seed = window.crypto.getRandomValues(new Uint8Array(32));
    const tsk = new vetkd.TransportSecretKey(seed);

    // const ekBytesHex = await actor.get_encrypted_symmetric_key(
    //   secretId,
    //   tsk.public_key(),
    //   userSecretKey
    // );
    // const pkBytesHex = await actor.get_user_encryption_key(userSecretKey);

    const ekBytesHex =
      await password_manager_dapp_backend.get_encrypted_symmetric_key(
        secretId,
        tsk.public_key(),
        userSecretKey
      );

    const pkBytesHex =
      await password_manager_dapp_backend.get_user_encryption_key(
        userSecretKey
      );

    const secretIdBytes: Uint8Array =
      stringTo128BitBigEndianUint8Array(secretId);
    const ownerUtf8: Uint8Array = new TextEncoder().encode(principalId);
    let derivationId = new Uint8Array(secretIdBytes.length + ownerUtf8.length);
    derivationId.set(secretIdBytes);
    derivationId.set(ownerUtf8, secretIdBytes.length);

    const aes256GcmKeyRaw = tsk.decrypt_and_hash(
      hexDecode(ekBytesHex),
      hexDecode(pkBytesHex),
      derivationId,
      32,
      new TextEncoder().encode('aes-256-gcm')
    );
    const dataKey: CryptoKey = await window.crypto.subtle.importKey(
      'raw',
      aes256GcmKeyRaw,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
    await set([secretId, principalId], dataKey);
  }
}

async function encryptWithSecretKey(
  secretId: string,
  userSecretKey: string,
  principalId: string,
  secretToStore: string,
  actor: any
) {
  await fetchKeyIfNeeded(secretId, userSecretKey, principalId, actor);
  const dataKey: CryptoKey | undefined = await get([secretId, principalId]);

  console.log(dataKey);
  if (!dataKey) {
    return;
  }

  const dataEncoded = Uint8Array.from(
    secretToStore.split('').map((ch: string) => ch.charCodeAt(0))
  ).buffer;

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    dataKey,
    dataEncoded
  );

  const ivDecoded = String.fromCharCode(...new Uint8Array(iv));
  const cipherDecoded = String.fromCharCode(...new Uint8Array(ciphertext));
  return ivDecoded + cipherDecoded;
}

async function decryptWithSecretKey(
  secretId: string,
  principalId: string,
  userSecretKey: string,
  userSecret: string,
  actor: any
) {
  await fetchKeyIfNeeded(secretId, userSecretKey, principalId, actor);
  const secretKey: CryptoKey | undefined = await get([secretId, principalId]);

  if (!secretKey) {
    return;
  }

  if (userSecret.length < 13) {
    throw new Error('wrong encoding, too short to contain iv');
  }
  const ivDecoded = userSecret.slice(0, 12);
  const cipherDecoded = userSecret.slice(12);
  const ivEncoded = Uint8Array.from(
    [...ivDecoded].map((ch) => ch.charCodeAt(0))
  ).buffer;
  const ciphertextEncoded = Uint8Array.from(
    [...cipherDecoded].map((ch) => ch.charCodeAt(0))
  ).buffer;

  let decryptedDataEncoded = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivEncoded,
    },
    secretKey,
    ciphertextEncoded
  );
  const decryptedDataDecoded = String.fromCharCode(
    ...new Uint8Array(decryptedDataEncoded)
  );
  return decryptedDataDecoded;
}

export const vetKeyService = {
  encryptWithSecretKey,
  decryptWithSecretKey,
};
