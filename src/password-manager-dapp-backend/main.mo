import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Buffer "mo:base/Buffer";
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
        key_id = { curve = #bls12_381_g2; name = "user_key" };
    });
    Hex.encode(Blob.toArray(public_key));
  };

  private func textToBigEndianByteArray(len: Nat, text: Text) : [Nat8] {
    let bytes : [Nat8] = Blob.toArray(Text.encodeUtf8(text));

    if (bytes.size() < len) {
        let padding : [Nat8] = Array.freeze(Array.init<Nat8>(len - bytes.size(), 0));
        return Array.append(bytes, padding);
    } else if (bytes.size() > len) {
        return Array.subArray<Nat8>(bytes, 0, len);
    };

    return bytes;
  };


  public shared ({ caller }) func get_encrypted_symmetric_key(data_id : Text, encryption_public_key : Blob, user_secret_key : Text) : async Text {
    let caller_text = Principal.toText(caller);
    
    let derivation_path = Array.make(Text.encodeUtf8(user_secret_key));
    
    let buf = Buffer.Buffer<Nat8>(32);
    buf.append(Buffer.fromArray(textToBigEndianByteArray(16, data_id)));
    buf.append(Buffer.fromArray(Blob.toArray(Text.encodeUtf8(caller_text))));
    let derivation_id = Blob.fromArray(Buffer.toArray(buf)); 
    
    let { encrypted_key } = await vetkd_system_api.vetkd_derive_encrypted_key({
        derivation_id;
        derivation_path = derivation_path;
        key_id = { curve = #bls12_381_g2; name = "user_key" };
        encryption_public_key;
    });
    
    Hex.encode(Blob.toArray(encrypted_key))
};


  func is_username_exists(username: Text): Bool {
    switch (Trie.get(usernames, Helpers.key(username), Text.equal)) {
        case (?username) return true;
        case (_) return false;
    }
  };

  public query ({ caller }) func get_user_by_id() : async ?Types.User {
    // let authenticated = Helpers.is_authenticated(caller);

    // if (authenticated == false) return null;

    let principal_id = Principal.toText(caller);

    switch (Trie.get(users, Helpers.key(principal_id), Text.equal)) {
        case (?user) return ?user;
        case (_) return null;
    }
  };

  public shared ({caller}) func register_user(username: Text, secret_key: Text) : async Types.User {
    // var authenticated = Helpers.is_authenticated(caller);

    // if (not authenticated) {
    //   throw Error.reject("Only authenticated users can register");
    // };

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
    // let authenticated = Helpers.is_authenticated(caller);

    // if (not authenticated) {
    //   return null;
    // };

    let principal_id = Principal.toText(caller);

    return Trie.get(secrets, Helpers.key(principal_id), Text.equal);
  };

  public query ({caller}) func get_user_secrets_titles() : async [Text] {
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
  };

  public shared ({caller}) func create_user_secret(title: Text, website: Text, description: Text, secret: Text) : async Text {
    if (Text.size(title) > 15) {
        throw Error.reject("Title must not exceed 15 characters.");
    };

    let existingSecret = await get_secret_data(title);

    switch existingSecret {
        case (?secret) {
          throw Error.reject("A secret with this title already exists.");
        };
        case (_) {
            let principal_id = Principal.toText(caller);

            let new_secret: Types.Secret = {
                principal_id = principal_id;
                title = title;
                website = website;
                description = description;
                secret = secret;
            };

            secrets := Trie.put2D(secrets, Helpers.key(principal_id), Text.equal, Helpers.key(title), Text.equal, new_secret);

            return "User secret created successfully.";
        };
    };
};

  //Functions for development and debug
  public query func get_all_users() : async Trie.Trie<Text, Types.User> {
    users;
  };

  public query func get_all_usernames() : async Trie.Trie<Text, Text> {
    usernames;
  };

  public shared func clear_data() : async Bool {
    users := Trie.empty();
    usernames := Trie.empty();
    secrets := Trie.empty();

    return true;
  }
};
