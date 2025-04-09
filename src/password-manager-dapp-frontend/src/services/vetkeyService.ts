import { get, set } from 'idb-keyval';
//@ts-ignore
import * as vetkd from 'ic-vetkd-utils';

const hexDecode = (hexString: string) =>
  Uint8Array.from(
    (hexString.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16))
  );

const hexDecode2 = (input: number[] | Uint8Array): Uint8Array =>
  new Uint8Array(input);

function bigintTo128BitBigEndianUint8Array(bn: bigint): Uint8Array {
  var hex = BigInt(bn).toString(16);

  while (hex.length < 32) {
    hex = '0' + hex;
  }

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
  secretId: bigint,
  principalId: string,
  actor: any
) {
  if (!(await get([secretId.toString(), principalId]))) {
    const seed = window.crypto.getRandomValues(new Uint8Array(32));
    const tsk = new vetkd.TransportSecretKey(seed);

    const ekBytesHex = await actor.get_encrypted_symmetric_key(
      secretId,
      tsk.public_key()
    );

    const pkBytesHex = await actor.get_user_encryption_key();

    const secretIdBytes: Uint8Array =
      bigintTo128BitBigEndianUint8Array(secretId);

    const ownerUtf8: Uint8Array = new TextEncoder().encode(principalId);

    let derivationId = new Uint8Array(secretIdBytes.length + ownerUtf8.length);

    derivationId.set(secretIdBytes);
    derivationId.set(ownerUtf8, secretIdBytes.length);

    const aes256GcmKeyRaw = tsk.decrypt_and_hash(
      hexDecode(ekBytesHex),
      hexDecode2(pkBytesHex),
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

    await set([secretId.toString(), principalId], dataKey);
  }
}

async function encryptWithSecretKey(
  secretId: bigint,
  principalId: string,
  secretToStore: string,
  actor: any
) {
  await fetchKeyIfNeeded(secretId, principalId, actor);

  const dataKey: CryptoKey | undefined = await get([
    secretId.toString(),
    principalId,
  ]);

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
  secretId: bigint,
  principalId: string,
  userSecret: string,
  actor: any
) {
  await fetchKeyIfNeeded(secretId, principalId, actor);

  const secretKey: CryptoKey | undefined = await get([
    secretId.toString(),
    principalId,
  ]);

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
