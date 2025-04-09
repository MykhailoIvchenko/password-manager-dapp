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
  stable var secretIdCount: Nat = 1;


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

  let vetkd_system_api : VETKD_SYSTEM_API = actor ("bquul-oaaaa-aaaag-at7ia-cai");

  public query func get_new_secret_id(): async (Nat) {       
    return secretIdCount;
  };

  public shared ({ caller }) func get_user_encryption_key(user_secret_key: Text) : async Blob {
    let { public_key } = await vetkd_system_api.vetkd_public_key({
        canister_id = null;
        derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"#user_secret_key));
        key_id = { curve = #bls12_381_g2; name = "test_key_1" };
    });

    return public_key;
  };

  private func nat_to_big_endian_byte_array(len: Nat, n: Nat) : [Nat8] {
    let ith_byte = func(i : Nat) : Nat8 {
        assert (i < len);
        let shift : Nat = 8 * (len - 1 - i);
        Nat8.fromIntWrap(n / 2 ** shift);
    };
    Array.tabulate<Nat8>(len, ith_byte);
  };

  public shared ({ caller }) func get_encrypted_symmetric_key(data_id : Nat, encryption_public_key : Blob, user_secret_key : Text) : async Text {
    let caller_text = Principal.toText(caller);
    
    let derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"#user_secret_key));
    
    let buf = Buffer.Buffer<Nat8>(32);
    buf.append(Buffer.fromArray(nat_to_big_endian_byte_array(16, data_id)));
    buf.append(Buffer.fromArray(Blob.toArray(Text.encodeUtf8(caller_text))));
    let derivation_id = Blob.fromArray(Buffer.toArray(buf)); 
    
    let { encrypted_key } = await vetkd_system_api.vetkd_derive_encrypted_key({
        derivation_id;
        derivation_path = derivation_path;
        key_id = { curve = #bls12_381_g2; name = "test_key_1" };
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
                id = secretIdCount;
                principal_id = principal_id;
                title = title;
                website = website;
                description = description;
                secret = secret;
            };

            secrets := Trie.put2D(secrets, Helpers.key(principal_id), Text.equal, Helpers.key(title), Text.equal, new_secret);

            secretIdCount += 1;

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
