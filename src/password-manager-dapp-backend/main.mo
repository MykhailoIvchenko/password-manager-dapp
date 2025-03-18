import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Types "types";
import Helpers "utils/helpers";
import Hex "utils/Hex";

actor SecureStorage {
  stable var usernames: Trie.Trie<Text, Text> = Trie.empty();
  stable var users: Trie.Trie<Text, Types.User> = Trie.empty();
  stable var secrets: Trie.Trie<Text, Trie.Trie<Text, Types.Secret>> = Trie.empty();

  type VETKD_SYSTEM_API = actor {
    vetkd_public_key : ({
        canister_id : ?Principal;
        derivation_path : [Blob];
        key_id : { curve : { #bls12_381_g2 }; name : Text };
    }) -> async ({ public_key : Blob });
    vetkd_derive_encrypted_key : ({
        derivation_path : [Blob];
        derivation_id : Blob;
        key_id : { curve : { #bls12_381_g2 }; name : Text };
        encryption_public_key : Blob;
    }) -> async ({ encrypted_key : Blob });
  };

  let vetkd_system_api : VETKD_SYSTEM_API = actor ("s55qq-oqaaa-aaaaa-aaakq-cai");

  public shared ({ caller }) func get_user_encryption_key(user_secret_key: Text) : async Text {
    let { public_key } = await vetkd_system_api.vetkd_public_key({
        canister_id = null;
        derivation_path = Array.make(Text.encodeUtf8(user_secret_key));
        key_id = { curve = #bls12_381_g2; name = "user_key_" # Principal.toText(caller) };
    });
    Hex.encode(Blob.toArray(public_key));
  };

  public shared ({ caller }) func encrypt_sensitive_data(user_secret_key : Text, sensitive_data : Text) : async Text {
    let encryption_key_hex = await get_user_encryption_key(user_secret_key);
    let encryption_key = Hex.decode(encryption_key_hex);

    let encrypted_data = AES.encrypt(sensitive_data, encryption_key);
    Hex.encode(Blob.toArray(encrypted_data));
  };

  public shared ({ caller }) func decrypt_sensitive_data(user_secret_key : Text, encrypted_data_hex : Text) : async Text {
    let encryption_key_hex = await get_user_encryption_key(user_secret_key);
    let encryption_key = Hex.decode(encryption_key_hex);

    let encrypted_data = Hex.decode(encrypted_data_hex);
    let decrypted_data = AES.decrypt(encrypted_data, encryption_key);
    Text.decodeUtf8(decrypted_data)!;
};

  func is_username_exists(username: Text): Bool {
    switch (Trie.get(usernames, Helpers.key(username), Text.equal)) {
        case (?username) return true;
        case (_) return false;
    }
  };

  public query ({ caller }) func get_user_by_id() : async ?Types.User {
    let authenticated = Helpers.is_authenticated(caller);

    if (authenticated == false) return null;

    let principal_id = Principal.toText(caller);

    switch (Trie.get(users, Helpers.key(principal_id), Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };

  public shared ({caller}) func register_user(username: Text, secret_key: Text) : async Types.User {
    var authenticated = Helpers.is_authenticated(caller);

    if (not authenticated) {
      throw Error.reject("Only authenticated users can register");
    };

    var is_valid_username = Helpers.validate_username(username);

    if (not is_valid_username) {
      throw Error.reject("Username is not valid. It should contain only alphanumeric symbols and have maximus size of 10 symbols");
    };

    var username_exists = is_username_exists(username);

    if (username_exists) {
      throw Error.reject("Username should be unique. And the username you've provided already exists");
    };
    
    let principal_id = Principal.toText(caller);

    let user_key : Trie.Key<Text> = Helpers.key(principal_id);

    let new_user: Types.User = { principal_id = principal_id; username = username; secret_key = secret_key };

    usernames := Trie.put(usernames, Helpers.key(username), Text.equal, username).0;

    users := Trie.put(users, user_key, Text.equal, new_user).0;

    return new_user;
  };

  public shared query ({caller}) func get_secret_data(secret_title: Text) : async ?Types.Secret {
    let authenticated = Helpers.is_authenticated(caller);

    if (not authenticated) {
      throw Error.reject("Only authenticated users can obtain data");
    };

    let principal_id = Principal.toText(caller);

    let user_secrets = Trie.get(secrets, Helpers.key(principal_id), Text.equal);

    switch (user_secrets) {
      case (?secrets_trie) {
        let target_secret = Trie.get(secrets_trie, Helpers.key(secret_title), Text.equal);
        return target_secret;
      };
      case (null) return null;
    };  
  };

  private func get_user_secrets_data(caller: Principal) : ?Trie.Trie<Text, Types.Secret> {
    let authenticated = Helpers.is_authenticated(caller);

    if (not authenticated) {
      return null;
    };

    let principal_id = Principal.toText(caller);

    return Trie.get(secrets, Helpers.key(principal_id), Text.equal);
};

  public query func get_user_secrets_titles({caller}: {caller: Principal}) : async [Text] {
    let user_secrets = get_user_secrets_data(caller);

    switch (user_secrets) {
        case (?secrets_trie) {
            let iter = Trie.iter(secrets_trie);
            var titles: [Text] = [];

            for ((key, _) in iter) {
                titles := Array.append(titles, [key]);
            };

            return titles;
        };
        case (null) return [];
    };
  };

  public shared query ({caller}) func get_secret_phrase(title: Text) : async ?Text {
    let user_secrets = get_user_secrets_data(caller);

    switch (user_secrets) {
        case (?secrets_trie) {
            let target_secret = Trie.get(secrets_trie, Helpers.key(title), Text.equal);

            switch (target_secret) {
                case (?secret) return ?secret.secret;
                case (null) return null;
            };
        };
        case (null) return null;
    };
  }
};
